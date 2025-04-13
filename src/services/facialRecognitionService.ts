import { createContext, useContext } from 'react';
import { toast } from 'sonner';

export interface FaceData {
  faceId: string;
  name: string;
  isAuthorized: boolean;
  ticketId?: string;
  role?: string;
  timestamp?: string;
  confidence?: number;
}

export interface FaceDetection {
  id: string; 
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: {
    leftEye: [number, number];
    rightEye: [number, number];
    nose: [number, number];
    mouth: [number, number];
  };
  matchedPerson?: FaceData;
  confidence: number;
  timestamp: string;
}

// Mock authorized personnel database
const authorizedPersonnel: FaceData[] = [
  {
    faceId: "face-001",
    name: "John Smith",
    isAuthorized: true,
    ticketId: "TKT-45678",
    role: "passenger"
  },
  {
    faceId: "face-002",
    name: "Sarah Davis",
    isAuthorized: true,
    ticketId: "TKT-45681",
    role: "passenger"
  },
  {
    faceId: "face-003",
    name: "Inspector Kumar",
    isAuthorized: true,
    role: "tte"
  },
  {
    faceId: "face-004",
    name: "Train Guard Singh",
    isAuthorized: true,
    role: "security"
  },
  // Add more authorized personnel as needed
];

// Mock unauthorized personnel for testing
const unauthorizedPersonnel: FaceData[] = [
  {
    faceId: "face-101",
    name: "Unknown Person 1",
    isAuthorized: false
  },
  {
    faceId: "face-102",
    name: "Unknown Person 2",
    isAuthorized: false
  }
];

// Mock last detection results for UI demonstration
let lastDetectionResults: FaceDetection[] = [];

// Recent detection history for logging
const detectionHistory: Array<FaceDetection & { coachId?: string }> = [];

// Simulate face detection from webcam/camera feed
export const detectFaces = async (imageData: ImageData | string): Promise<FaceDetection[]> => {
  // In a real implementation, this would call a machine learning model API
  // For this mock, we'll randomly return some face detections
  
  const mockDetections: FaceDetection[] = [];
  const numberOfFaces = Math.floor(Math.random() * 3) + 1; // 1-3 faces
  
  for (let i = 0; i < numberOfFaces; i++) {
    const detection: FaceDetection = {
      id: `detection-${Date.now()}-${i}`,
      boundingBox: {
        x: Math.random() * 0.8, // normalized coordinates (0-1)
        y: Math.random() * 0.8,
        width: 0.1 + Math.random() * 0.2,
        height: 0.1 + Math.random() * 0.2
      },
      confidence: 0.5 + Math.random() * 0.5, // 0.5-1.0 confidence
      timestamp: new Date().toISOString()
    };
    
    mockDetections.push(detection);
  }
  
  // Store the latest detections for retrieval
  lastDetectionResults = mockDetections;
  
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(() => resolve(mockDetections), 500);
  });
};

// Match detected faces against authorized/unauthorized personnel
export const recognizeFaces = async (detections: FaceDetection[]): Promise<FaceDetection[]> => {
  // In a real implementation, this would compare face embeddings against a database
  // For this mock, we'll randomly match some faces
  
  const recognizedDetections = detections.map(detection => {
    const recognizedDetection = { ...detection };
    
    // Random chance of recognition (80%)
    if (Math.random() > 0.2) {
      // 70% chance of finding an authorized person, 30% unauthorized
      if (Math.random() > 0.3) {
        const randomAuthorizedIndex = Math.floor(Math.random() * authorizedPersonnel.length);
        recognizedDetection.matchedPerson = {
          ...authorizedPersonnel[randomAuthorizedIndex],
          confidence: 0.7 + Math.random() * 0.3, // 0.7-1.0 confidence for authorized
          timestamp: new Date().toISOString()
        };
      } else {
        const randomUnauthorizedIndex = Math.floor(Math.random() * unauthorizedPersonnel.length);
        recognizedDetection.matchedPerson = {
          ...unauthorizedPersonnel[randomUnauthorizedIndex],
          confidence: 0.7 + Math.random() * 0.3, // 0.7-1.0 confidence for unauthorized
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return recognizedDetection;
  });
  
  // Update stored results with recognized data
  lastDetectionResults = recognizedDetections;
  
  // Add to detection history (limit to last 100 entries)
  detectionHistory.unshift(...recognizedDetections.map(d => ({ ...d, coachId: getRandomCoachId() })));
  if (detectionHistory.length > 100) {
    detectionHistory.length = 100;
  }
  
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(() => resolve(recognizedDetections), 700);
  });
};

// Helper function to get random coach ID
const getRandomCoachId = (): string => {
  const coaches = ["ENGINE", "A1", "B1", "C1"];
  return coaches[Math.floor(Math.random() * coaches.length)];
};

// Get the latest detection results (for UI display)
export const getLatestDetectionResults = (): FaceDetection[] => {
  return lastDetectionResults;
};

// Get detection history (for logs)
export const getDetectionHistory = (): Array<FaceDetection & { coachId?: string }> => {
  return detectionHistory;
};

// Add a new authorized person to the system
export const addAuthorizedPerson = (person: Omit<FaceData, 'faceId'>): FaceData => {
  const newPerson: FaceData = {
    ...person,
    faceId: `face-${Date.now()}`,
    isAuthorized: true
  };
  
  authorizedPersonnel.push(newPerson);
  toast.success(`${newPerson.name} added to authorized personnel database`);
  
  return newPerson;
};

// Remove a person from the authorized list
export const removeAuthorizedPerson = (faceId: string): boolean => {
  const index = authorizedPersonnel.findIndex(p => p.faceId === faceId);
  if (index !== -1) {
    const person = authorizedPersonnel[index];
    authorizedPersonnel.splice(index, 1);
    toast.success(`${person.name} removed from authorized personnel database`);
    return true;
  }
  return false;
};

// Get all authorized personnel
export const getAllAuthorizedPersonnel = (): FaceData[] => {
  return [...authorizedPersonnel];
};

// Generate security alert for unauthorized entry
export const generateSecurityAlert = (detection: FaceDetection, coachId: string): void => {
  if (detection.matchedPerson && !detection.matchedPerson.isAuthorized) {
    toast.error(`Security Alert: Unauthorized person detected in coach ${coachId}`, {
      duration: 5000
    });
    
    // In a real system, this would notify security personnel and update security logs
    console.log(`SECURITY ALERT: Unauthorized entry detected in coach ${coachId}`);
  }
};

// Facial Recognition Context (for React components)
type FacialRecognitionContextType = {
  startRecognition: (coachId: string) => Promise<void>;
  stopRecognition: () => void;
  isRecognizing: boolean;
  lastDetection: FaceDetection[] | null;
};

export const FacialRecognitionContext = createContext<FacialRecognitionContextType | undefined>(undefined);

export const useFacialRecognition = () => {
  const context = useContext(FacialRecognitionContext);
  if (context === undefined) {
    throw new Error("useFacialRecognition must be used within a FacialRecognitionProvider");
  }
  return context;
}; 