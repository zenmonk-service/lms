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
const DETECTION_INTERVAL = 500;

const FaceDetection: React.FC<FaceDetectionProps> = ({ setVerified }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const referenceDescriptorRef = useRef<Float32Array | null>(null);
  const mountedRef = useRef(false);
  const detectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [hasReferenceImage, setHasReferenceImage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const referenceImageUrl = useAppSelector((s) => s.userSlice.currentUser?.image);

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
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected in the reference image.");
        return;
      }
      referenceDescriptorRef.current = detection.descriptor;
      return true;
    } catch (error) {
      console.error("Error loading reference image:", error);
      return false;
    }
  }, [referenceImageUrl, setVerified]);

  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !mountedRef.current || !referenceDescriptorRef.current) return;

    const loop = async () => {
      if (!video || !canvas || !mountedRef.current) return;

      try {
        const displaySize = { width: video.clientWidth, height: video.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const resized = faceapi.resizeResults(detections, displaySize);

        if (resized.length === 1) {
          const distance = faceapi.euclideanDistance(
            referenceDescriptorRef.current!,
            resized[0].descriptor,
          );
          const matched = distance < MATCH_THRESHOLD;

          new faceapi.draw.DrawBox(resized[0].detection.box, {
            label: matched ? "Verified" : "Not Verified",
            boxColor: matched ? "rgb(0,255,0)" : "rgb(255,0,0)",
            lineWidth: 2,
          }).draw(canvas);

          setIsVerified(matched);
          setVerified(matched);
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
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
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
  }, []);  // intentionally empty — runs once on mount

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
  if(error) {
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
          <Button variant="destructive" onClick={handleTryAgain}>Try Again</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full bg-card rounded-lg">
      <div className="relative w-full aspect-video rounded-md overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-8 w-8 border-4 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
      </div>
    </div>
  );
};

export default React.memo(FaceDetection);