// Mock data service for train coach information
// In a real application, this would connect to your backend API

export interface CoachData {
  id: string;
  capacity: number;
  occupancy: number;
  unauthorizedEntries: number;
  securityAlerts: number;
  interiorFeatures?: {
    hasWifi: boolean;
    hasCatering: boolean;
    hasAccessibleToilet: boolean;
    seatClass: "standard" | "first" | "business" | "sleeper";
  };
  securityStatus?: {
    lastScan: string;
    facialRecognitionActive: boolean;
    securityLevel: "normal" | "elevated" | "high";
  };
}

// Mock data for train coaches with enhanced details
const coachesData: CoachData[] = [
  {
    id: "ENGINE",
    capacity: 4,
    occupancy: 3,
    unauthorizedEntries: 0,
    securityAlerts: 0,
    interiorFeatures: {
      hasWifi: true,
      hasCatering: false,
      hasAccessibleToilet: false,
      seatClass: "standard"
    },
    securityStatus: {
      lastScan: new Date().toISOString(),
      facialRecognitionActive: false,
      securityLevel: "normal"
    }
  },
  {
    id: "A1",
    capacity: 72,
    occupancy: 56,
    unauthorizedEntries: 2,
    securityAlerts: 1,
    interiorFeatures: {
      hasWifi: true,
      hasCatering: true,
      hasAccessibleToilet: true,
      seatClass: "first"
    },
    securityStatus: {
      lastScan: new Date().toISOString(),
      facialRecognitionActive: false,
      securityLevel: "elevated"
    }
  },
  {
    id: "B1",
    capacity: 72,
    occupancy: 68,
    unauthorizedEntries: 0,
    securityAlerts: 0,
    interiorFeatures: {
      hasWifi: true,
      hasCatering: false,
      hasAccessibleToilet: true,
      seatClass: "standard"
    },
    securityStatus: {
      lastScan: new Date().toISOString(),
      facialRecognitionActive: false,
      securityLevel: "normal"
    }
  },
  {
    id: "C1",
    capacity: 72,
    occupancy: 45,
    unauthorizedEntries: 1,
    securityAlerts: 1,
    interiorFeatures: {
      hasWifi: true,
      hasCatering: true,
      hasAccessibleToilet: true,
      seatClass: "business"
    },
    securityStatus: {
      lastScan: new Date().toISOString(),
      facialRecognitionActive: false,
      securityLevel: "elevated"
    }
  },
];

// Get all coach data
export const getAllCoachesData = (): CoachData[] => {
  return coachesData;
};

// Get data for a specific coach
export const getCoachData = (id: string): CoachData | undefined => {
  return coachesData.find((coach) => coach.id === id);
};

// Calculate total stats
export const getTotalStats = () => {
  return coachesData.reduce(
    (acc, coach) => {
      acc.totalCapacity += coach.capacity;
      acc.totalOccupancy += coach.occupancy;
      acc.totalUnauthorized += coach.unauthorizedEntries;
      acc.totalAlerts += coach.securityAlerts;
      return acc;
    },
    {
      totalCapacity: 0,
      totalOccupancy: 0,
      totalUnauthorized: 0,
      totalAlerts: 0,
    }
  );
};

// Update coach security status and handles unauthorized entry detection
export const updateCoachSecurityStatus = (coachId: string, hasUnauthorizedEntry: boolean = false): boolean => {
  const coach = coachesData.find((c) => c.id === coachId);
  
  if (!coach) {
    console.error(`Coach with ID ${coachId} not found`);
    return false;
  }
  
  // Ensure security status object exists
  if (!coach.securityStatus) {
    coach.securityStatus = {
      lastScan: new Date().toISOString(),
      facialRecognitionActive: true,
      securityLevel: "normal"
    };
  } else {
    // Update last scan time
    coach.securityStatus.lastScan = new Date().toISOString();
    coach.securityStatus.facialRecognitionActive = true;
  }
  
  // If there's an unauthorized entry, update the counts and security level
  if (hasUnauthorizedEntry) {
    coach.unauthorizedEntries += 1;
    coach.securityAlerts += 1;
    coach.securityStatus.securityLevel = "high";
    
    // Log this security event
    console.log(`Security alert: Unauthorized entry in coach ${coachId}`);
  }
  
  return true;
};

// Set facial recognition activity status for a coach
export const setFacialRecognitionActive = (coachId: string, isActive: boolean): boolean => {
  const coach = coachesData.find((c) => c.id === coachId);
  
  if (!coach) {
    console.error(`Coach with ID ${coachId} not found`);
    return false;
  }
  
  // Ensure security status object exists
  if (!coach.securityStatus) {
    coach.securityStatus = {
      lastScan: new Date().toISOString(),
      facialRecognitionActive: isActive,
      securityLevel: "normal"
    };
  } else {
    coach.securityStatus.facialRecognitionActive = isActive;
  }
  
  return true;
};

// Reset security alerts for all coaches (for testing purposes)
export const resetSecurityAlerts = (): void => {
  coachesData.forEach(coach => {
    coach.unauthorizedEntries = 0;
    coach.securityAlerts = 0;
    if (coach.securityStatus) {
      coach.securityStatus.securityLevel = "normal";
    }
  });
};
