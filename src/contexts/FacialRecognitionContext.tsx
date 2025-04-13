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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionInterval.current) {
        window.clearInterval(recognitionInterval.current);
        recognitionInterval.current = null;
      }
    };
  }, []);

  const startRecognition = useCallback(async (coachId: string) => {
    setCurrentCoachId(coachId);
    setIsRecognizing(true);
    toast.info(`Starting facial recognition in coach ${coachId}...`);

    // Initial detection
    try {
      // In a real app, we would capture from a camera here
      const detections = await detectFaces("mock-camera-feed");
      const recognizedFaces = await recognizeFaces(detections);
      
      setLastDetection(recognizedFaces);
      
      // Check for unauthorized entries
      recognizedFaces.forEach(face => {
        if (face.matchedPerson && !face.matchedPerson.isAuthorized) {
          generateSecurityAlert(face, coachId);
          updateCoachSecurityStatus(coachId, true);
        }
      });
    } catch (error) {
      console.error("Error in facial recognition:", error);
      toast.error("Failed to start facial recognition");
      setIsRecognizing(false);
      return;
    }

    // Continue with periodic recognition
    recognitionInterval.current = window.setInterval(async () => {
      try {
        // In a real app, we would capture from a camera here
        const detections = await detectFaces("mock-camera-feed");
        const recognizedFaces = await recognizeFaces(detections);
        
        setLastDetection(recognizedFaces);
        
        // Check for unauthorized entries
        recognizedFaces.forEach(face => {
          if (face.matchedPerson && !face.matchedPerson.isAuthorized) {
            generateSecurityAlert(face, coachId);
            updateCoachSecurityStatus(coachId, true);
          }
        });
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
    
    setIsRecognizing(false);
    setCurrentCoachId(null);
    toast.info("Facial recognition stopped");
  }, []);

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