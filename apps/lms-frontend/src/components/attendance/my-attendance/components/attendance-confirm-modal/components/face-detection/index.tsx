"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store";

interface FaceDetectionProps {
  setVerified: (verified: boolean) => void;
}

const MATCH_THRESHOLD = 0.3;
const MODEL_URL = "/models";
// Reduced to 100ms to ensure we catch fast blinks
const DETECTION_INTERVAL = 100;
const BLINK_THRESHOLD = 0.25;

// Helper to calculate Eye Aspect Ratio (EAR) for blink detection
const getDistance = (
  p1: Pick<faceapi.Point, "x" | "y">,
  p2: Pick<faceapi.Point, "x" | "y">,
) =>
  Math.hypot(p1.x - p2.x, p1.y - p2.y);
const calculateEAR = (eye: faceapi.Point[]) => {
  const v1 = getDistance(eye[1], eye[5]);
  const v2 = getDistance(eye[2], eye[4]);
  const h = getDistance(eye[0], eye[3]);
  return (v1 + v2) / (2.0 * h);
};

const FaceDetection: React.FC<FaceDetectionProps> = ({ setVerified }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const referenceDescriptorRef = useRef<Float32Array | null>(null);
  const mountedRef = useRef(false);
  const detectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Tracks if a human blink was detected during this session
  const livenessRef = useRef(false);

  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [hasReferenceImage, setHasReferenceImage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const referenceImageUrl = useAppSelector(
    (s) => s.userSlice.currentUser?.image,
  );

  const cleanup = useCallback(() => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
    setError(null);
  }, []);

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]);
      return true;
    } catch (error) {
      console.error("Error loading face-api models:", error);
      return false;
    }
  }, []);

const loadReferenceDescriptor = useCallback(async () => {
  if (!referenceImageUrl) {
    setHasReferenceImage(false);
    setVerified(false);
    return false;
  }
  try {
    const img = await faceapi.fetchImage(referenceImageUrl);

    // 1. Increase confidence threshold to lower false positives
    const detection = await faceapi
      .detectSingleFace(
        img,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75 })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setError(
        "No human face detected in reference photo. Please upload a clear photo of your face."
      );
      setVerified(false);
      return false;
    }

    // 2. Extract landmark feature sets
    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const mouth = landmarks.getMouth();

    if (
      !leftEye.length ||
      !rightEye.length ||
      !nose.length ||
      !mouth.length
    ) {
      setError("Reference image does not contain valid facial landmarks.");
      setVerified(false);
      return false;
    }

    // 3. ANATOMICAL HUMAN PROPORTION CHECKS
    // Get center points of features
    const getCenter = (points: faceapi.Point[]) => ({
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    });

    const leftEyeCenter = getCenter(leftEye);
    const rightEyeCenter = getCenter(rightEye);
    const noseTip = nose[nose.length - 1]; // Tip of the nose
    const mouthCenter = getCenter(mouth);

    // Distance calculations
// 1. Calculate eye mid-point as a proper faceapi.Point instance
    const eyeMidPoint = new faceapi.Point(
      (leftEyeCenter.x + rightEyeCenter.x) / 2,
      (leftEyeCenter.y + rightEyeCenter.y) / 2
    );

    // 2. Compute distances with correctly typed inputs and fixed variable names
    const eyeDistance = getDistance(leftEyeCenter, rightEyeCenter);
    const eyeToNoseDistance = getDistance(eyeMidPoint, noseTip);
    const noseToMouthDistance = getDistance(noseTip, mouthCenter);

    // Geometric Ratios (Human faces fall within specific proportion ranges)
    const eyeToNoseRatio = eyeToNoseDistance / eyeDistance;
    const noseToMouthRatio = noseToMouthDistance / eyeDistance;

    // Animal snouts create elongated eye-to-nose or nose-to-mouth proportions relative to eye spacing
    const isValidHumanProportions =
      eyeToNoseRatio >= 0.35 &&
      eyeToNoseRatio <= 0.85 &&
      noseToMouthRatio >= 0.25 &&
      noseToMouthRatio <= 0.75;

    if (!isValidHumanProportions) {
      setError(
        "Proportions do not match a human face. Please upload a clear human photograph."
      );
      setVerified(false);
      return false;
    }

    referenceDescriptorRef.current = detection.descriptor;
    setError(null);
    return true;
  } catch (err) {
    console.error("Error loading reference image:", err);
    setError(
      "Failed to load reference photo. Please try uploading a new one."
    );
    setVerified(false);
    return false;
  }
}, [referenceImageUrl, setVerified]);
  
  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (
      !video ||
      !canvas ||
      !mountedRef.current ||
      !referenceDescriptorRef.current
    )
      return;

    const loop = async () => {
      if (!video || !canvas || !mountedRef.current) return;

      try {
        const displaySize = {
          width: video.clientWidth,
          height: video.clientHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const resized = faceapi.resizeResults(detections, displaySize);

        if (resized.length === 1) {
          const face = resized[0];

          // 1. LIVENESS CHECK (Blink Detection)
          const leftEye = face.landmarks.getLeftEye();
          const rightEye = face.landmarks.getRightEye();
          const avgEAR = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2;

          // If EAR falls below threshold, register as human blink
          if (avgEAR < BLINK_THRESHOLD) {
            livenessRef.current = true;
            setIsHuman(true);
          }

          // 2. RECOGNITION CHECK
          const distance = faceapi.euclideanDistance(
            referenceDescriptorRef.current!,
            face.descriptor,
          );
          const matched = distance < MATCH_THRESHOLD;

          // Must match AND have blinked to be fully verified
          const fullyVerified = matched && livenessRef.current;

          // Update bounding box color and text based on state
          let label = "Not Verified";
          let boxColor = "rgb(255,0,0)"; // Red

          if (fullyVerified) {
            label = "Verified Human";
            boxColor = "rgb(0,255,0)"; // Green
          } else if (matched && !livenessRef.current) {
            label = "Match Found - Please Blink!";
            boxColor = "rgb(255,165,0)"; // Orange
          }

          new faceapi.draw.DrawBox(face.detection.box, {
            label,
            boxColor,
            lineWidth: 2,
          }).draw(canvas);

          setIsVerified(fullyVerified);
          setVerified(fullyVerified);
        } else {
          resized.forEach((d) =>
            new faceapi.draw.DrawBox(d.detection.box, {
              label: "Not Verified",
              boxColor: "rgb(255,0,0)",
              lineWidth: 2,
            }).draw(canvas),
          );
          setIsVerified(false);
          setVerified(false);
        }
      } catch (error) {
        console.error("Detection error:", error);
      }

      if (mountedRef.current) {
        detectionTimeoutRef.current = setTimeout(loop, DETECTION_INTERVAL);
      }
    };

    loop();
  }, [setVerified]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!devices.some((d) => d.kind === "videoinput")) {
        setCameraAvailable(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (!videoRef.current || !mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      const onLoaded = () => {
        videoRef.current?.play();

        // create canvas once
        if (!canvasRef.current && videoRef.current) {
          const canvas = faceapi.createCanvasFromMedia(videoRef.current);
          canvas.style.cssText = "position:absolute;top:0;left:0;";
          videoRef.current.parentNode?.appendChild(canvas);
          canvasRef.current = canvas;
        }

        runDetectionLoop();
        videoRef.current?.removeEventListener("loadedmetadata", onLoaded);
      };

      videoRef.current.addEventListener("loadedmetadata", onLoaded);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [runDetectionLoop]);

  const handleTryAgain = () => {
    cleanup();
    setCameraAvailable(true);
    setIsVerified(false);
    setIsHuman(false);
    livenessRef.current = false;
    startCamera();
  };

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      if (!referenceImageUrl) {
        setHasReferenceImage(false);
        setIsLoading(false);
        return;
      }
      const modelsLoaded = await loadModels();
      const referenceLoaded = await loadReferenceDescriptor();

      if (modelsLoaded && referenceLoaded && mountedRef.current) {
        startCamera();
      } else {
        setCameraAvailable(false);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  if (!hasReferenceImage) {
    return (
      <div className="w-full bg-card rounded-lg">
        <div className="relative w-full aspect-video rounded-md overflow-hidden flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-2 shadow-sm ring-1 ring-rose-100">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Reference Image</h3>
          <p className="text-muted-foreground text-sm">
            Please register your face image first to use face verification.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-card rounded-lg">
        <div className="relative w-full aspect-video rounded-md overflow-hidden flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-2 shadow-sm ring-1 ring-rose-100">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Error</h3>
          <p className="text-muted-foreground text-sm">
            No human face detected. Please upload a clear photo of your face
          </p>
        </div>
      </div>
    );
  }

  if (!cameraAvailable) {
    return (
      <div className="w-full bg-card rounded-lg">
        <div className="relative w-full aspect-video rounded-md overflow-hidden flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-2 shadow-sm ring-1 ring-rose-100">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Camera Not Available</h3>
          <Button variant="destructive" onClick={handleTryAgain}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg">
      <div className="relative w-full aspect-video rounded-md overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
            <div className="h-8 w-8 border-4 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Helper text asking the user to blink if they are matched but haven't blinked yet */}
        {!isVerified && !isHuman && !isLoading && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-black/60 text-white px-4 py-2 rounded-md text-sm backdrop-blur-sm font-medium">
              Look at the camera and blink
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FaceDetection);
