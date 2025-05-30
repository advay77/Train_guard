import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from "react";
import { 
  FaceDetection, 
  FacialRecognitionContext as FRContext,
  detectFaces,
  recognizeFaces,
  generateSecurityAlert
} from "@/services/facialRecognitionService";
import { toast } from "sonner";

// Update coachDataService with facial recognition data
import { updateCoachSecurityStatus } from "@/services/coachDataService";

interface FacialRecognitionProviderProps {
  children: ReactNode;
}

export const FacialRecognitionProvider = ({ children }: FacialRecognitionProviderProps) => {
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [lastDetection, setLastDetection] = useState<FaceDetection[] | null>(null);
  const [currentCoachId, setCurrentCoachId] = useState<string | null>(null);
  const recognitionInterval = useRef<number | null>(null);

  // Clean up on unmount and when recognition stops
  useEffect(() => {
    return () => {
      if (recognitionInterval.current) {
        window.clearInterval(recognitionInterval.current);
        recognitionInterval.current = null;
      }
      setIsRecognizing(false);
      setCurrentCoachId(null);
    };
  }, []);

  const startRecognition = useCallback(async (coachId: string) => {
    // Prevent multiple intervals
    if (recognitionInterval.current) {
      window.clearInterval(recognitionInterval.current);
      recognitionInterval.current = null;
    }
    setCurrentCoachId(coachId);
    setIsRecognizing(true);
    toast.info(`Starting facial recognition in coach ${coachId}...`);

    // Helper to process detections and update security status
    const processDetections = (recognizedFaces: FaceDetection[]) => {
      setLastDetection(recognizedFaces);
      let unauthorizedFound = false;
      recognizedFaces.forEach(face => {
        if (face.matchedPerson && !face.matchedPerson.isAuthorized) {
          unauthorizedFound = true;
          generateSecurityAlert(face, coachId);
        }
      });
      updateCoachSecurityStatus(coachId, unauthorizedFound);
    };

    // Initial detection
    try {
      const detections = await detectFaces("mock-camera-feed");
      const recognizedFaces = await recognizeFaces(detections);
      processDetections(recognizedFaces);
    } catch (error) {
      console.error("Error in facial recognition:", error);
      toast.error("Failed to start facial recognition");
      setIsRecognizing(false);
      setCurrentCoachId(null);
      return;
    }

    // Continue with periodic recognition
    recognitionInterval.current = window.setInterval(async () => {
      try {
        const detections = await detectFaces("mock-camera-feed");
        const recognizedFaces = await recognizeFaces(detections);
        processDetections(recognizedFaces);
      } catch (error) {
        console.error("Error in facial recognition interval:", error);
      }
    }, 5000); // Run every 5 seconds
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionInterval.current) {
      window.clearInterval(recognitionInterval.current);
      recognitionInterval.current = null;
    }
    if (currentCoachId) {
      // Reset coach security status when stopping recognition
      updateCoachSecurityStatus(currentCoachId, false);
    }
    setIsRecognizing(false);
    setCurrentCoachId(null);
    setLastDetection(null);
    toast.info("Facial recognition stopped");
  }, [currentCoachId]);

  return (
    <FRContext.Provider
      value={{
        startRecognition,
        stopRecognition,
        isRecognizing,
        lastDetection
      }}
    >
      {children}
    </FRContext.Provider>
  );
};

export const useFacialRecognition = () => {
  return useContext(FRContext);
};