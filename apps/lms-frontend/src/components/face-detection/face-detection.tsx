"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store";

interface FaceDetectionProps {
  setVerified?: (verified: boolean) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}

enum VerificationStatus {
  VERIFIED = "verified",
  NOT_VERIFIED = "not_verified",
}

const FaceDetection: React.FC<FaceDetectionProps> = ({
  setVerified,
  onCancel,
  onConfirm,
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const referenceDescriptorRef = useRef<Float32Array | null>(null);
  const mountedRef = useRef<boolean>(false);

  // State
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  // Get reference image URL from store
  const referenceImageUrl = useAppSelector(
    (state) => state.userSlice.currentUser?.image
  );

  // Constants
  const MATCH_THRESHOLD = 0.3; // Lower value means stricter matching
  const MODEL_URL = "/models";
  const DETECTION_INTERVAL = 500; // ms

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Load face-api.js models
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

  // Load reference face descriptor
  const loadReferenceDescriptor = useCallback(async () => {
    if (!referenceImageUrl) {
      console.error("No reference image URL provided");
      return false;
    }

    try {
      const img = await faceapi.fetchImage(referenceImageUrl);

      // Use SSD MobileNet for more accurate face detection on static images
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.error("No face detected in reference image");
        return false;
      }

      // Store the face descriptor for later comparison
      referenceDescriptorRef.current = detection.descriptor;
      return true;
    } catch (error) {
      console.error("Error loading reference image:", error);
      return false;
    }
  }, [referenceImageUrl]);

  // Start camera
  const startCamera = useCallback(async () => {
    setIsLoading(true);

    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");

      if (!hasCamera) {
        setCameraAvailable(false);
        setIsLoading(false);
        return;
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      // Set the stream to video element
      if (videoRef.current && mountedRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Start face detection when video is playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startFaceDetection();
        };
      } else {
        // Cleanup if component unmounted during async operation
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setCameraAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Try Again button click
  const handleTryAgain = () => {
    setCameraAvailable(true);
    setVerificationStatus(null);
    startCamera();
  };

  // Start face detection process
  const startFaceDetection = useCallback(async () => {
    if (
      !videoRef.current ||
      !mountedRef.current ||
      !referenceDescriptorRef.current
    )
      return;

    const video = videoRef.current;

    // Create canvas if not already created
    if (!canvasRef.current) {
      const canvas = faceapi.createCanvasFromMedia(video);
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";

      video.parentNode?.appendChild(canvas);
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    const displaySize = {
      width: video.clientWidth,
      height: video.clientHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);

    // Start detection loop
    const detectionLoop = async () => {
      if (!video || !canvas || !mountedRef.current) return;

      try {
        // Detect all faces in video stream
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Clear previous drawings
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        // Resize detections to match display size
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        // Check if there's exactly one face
        if (resizedDetections.length === 1) {
          const faceDescriptor = resizedDetections[0].descriptor;

          // Compare with reference descriptor
          const distance = faceapi.euclideanDistance(
            referenceDescriptorRef.current!,
            faceDescriptor
          );

          const isMatch = distance < MATCH_THRESHOLD;

          // Draw detection box
          const box = resizedDetections[0].detection.box;
          const drawOptions = {
            label: isMatch ? "Verified" : "Not Verified",
            boxColor: isMatch ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)",
            lineWidth: 2,
          };

          const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
          drawBox.draw(canvas);

          // Update verification status
          setVerificationStatus(
            isMatch
              ? VerificationStatus.VERIFIED
              : VerificationStatus.NOT_VERIFIED
          );
        } else if (resizedDetections.length > 1) {
          // Multiple faces detected - mark as not verified
          resizedDetections.forEach((detection) => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: "Not Verified",
              boxColor: "rgb(255, 0, 0)",
              lineWidth: 2,
            });
            drawBox.draw(canvas);
          });
          setVerificationStatus(VerificationStatus.NOT_VERIFIED);
        } else {
          // No face detected
          setVerificationStatus(null);
        }

        // Continue detection loop if component still mounted
        if (mountedRef.current) {
          setTimeout(detectionLoop, DETECTION_INTERVAL);
        }
      } catch (error) {
        console.error("Error in face detection loop:", error);
        if (mountedRef.current) {
          setTimeout(detectionLoop, DETECTION_INTERVAL);
        }
      }
    };

    // Start the detection loop
    detectionLoop();
  }, [setVerified]);

  // Initialize on component mount
  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      setIsLoading(true);

      // Load models and reference descriptor
      const modelsLoaded = await loadModels();
      const referenceLoaded = await loadReferenceDescriptor();

      if (modelsLoaded && referenceLoaded && mountedRef.current ) {
        startCamera();
      } else {
        setCameraAvailable(false);
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [loadModels, loadReferenceDescriptor, startCamera, cleanup]);

  useEffect(() => {
    if (verificationStatus == VerificationStatus.VERIFIED) {
      setVerified && setVerified(true);
    } else {
      setVerified && setVerified(false);
    }
  }, [verificationStatus]);

  return (
    <div className="bg-gray-50 rounded-lg flex flex-col items-center justify-center">
      {!cameraAvailable ? (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="font-semibold text-lg mb-2">Camera Not Available</h3>
          <p className="text-gray-600 mb-4">No camera available</p>

          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-6"
            onClick={handleTryAgain}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="w-full relative">
          <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>

          {verificationStatus === VerificationStatus.VERIFIED && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 font-medium rounded-md text-center">
              User Verified
            </div>
          )}

          {verificationStatus === VerificationStatus.NOT_VERIFIED && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 font-medium rounded-md text-center">
              User Not Verified
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceDetection;