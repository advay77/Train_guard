import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Camera, User, AlertTriangle, Loader2 } from "lucide-react";
import { useFacialRecognition } from "@/contexts/FacialRecognitionContext";
import { getAllCoachesData, setFacialRecognitionActive } from "@/services/coachDataService";

export function FacialRecognition() {
  const [selectedCoach, setSelectedCoach] = useState<string>("A1");
  const { startRecognition, stopRecognition, isRecognizing, lastDetection } = useFacialRecognition();
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "complete">("idle");

  const coachesData = getAllCoachesData();

  // Handle coach selection
  const handleCoachChange = (value: string) => {
    if (isRecognizing) {
      stopRecognition();
      setProcessingStatus("idle");
    }
    setSelectedCoach(value);
  };

  // Start recognition for the selected coach
  const handleStartRecognition = async () => {
    if (!selectedCoach || isRecognizing) return;
    setProcessingStatus("processing");
    await startRecognition(selectedCoach);
    setFacialRecognitionActive(selectedCoach, true);
  };

  // Stop recognition
  const handleStopRecognition = () => {
    stopRecognition();
    if (selectedCoach) {
      setFacialRecognitionActive(selectedCoach, false);
    }
    setProcessingStatus("idle");
  };

  // Reset state if coach changes while recognizing
  useEffect(() => {
    setProcessingStatus(isRecognizing ? "processing" : "idle");
  }, [selectedCoach, isRecognizing]);

  // Set processing status based on new detections
  useEffect(() => {
    if (lastDetection && lastDetection.length > 0) {
      setProcessingStatus("complete");
      // Reset to processing after 2 seconds to simulate continuous processing
      const timer = setTimeout(() => {
        if (isRecognizing) {
          setProcessingStatus("processing");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastDetection, isRecognizing]);

  // Count of unauthorized faces in last detection
  const unauthorizedCount = lastDetection?.filter(
    face => face.matchedPerson && !face.matchedPerson.isAuthorized
  ).length || 0;

  // Count of authorized faces in last detection
  const authorizedCount = lastDetection?.filter(
    face => face.matchedPerson && face.matchedPerson.isAuthorized
  ).length || 0;

  // Count of unrecognized faces
  const unrecognizedCount = lastDetection?.filter(
    face => !face.matchedPerson
  ).length || 0;

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2 text-primary" />
          Facial Recognition System
        </CardTitle>
        <CardDescription>
          Monitor and control real-time facial recognition to identify authorized and unauthorized individuals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Coach Selection */}
        <div className="grid gap-2">
          <label htmlFor="coach-select" className="text-sm font-medium">
            Select Coach for Surveillance
          </label>
          <Select 
            value={selectedCoach} 
            onValueChange={handleCoachChange}
            disabled={isRecognizing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select coach" />
            </SelectTrigger>
            <SelectContent>
              {coachesData.map(coach => (
                <SelectItem key={coach.id} value={coach.id}>
                  Coach {coach.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{authorizedCount}</div>
            <div className="text-xs text-muted-foreground">Authorized</div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{unauthorizedCount}</div>
            <div className="text-xs text-muted-foreground">Unauthorized</div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
            <User className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{unrecognizedCount}</div>
            <div className="text-xs text-muted-foreground">Unrecognized</div>
          </div>
        </div>
        
        {/* Processing Status */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Recognition Status</span>
            
            {processingStatus === "processing" && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
            
            {processingStatus === "complete" && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Scan Complete
              </Badge>
            )}
            
            {processingStatus === "idle" && (
              <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500">
                Idle
              </Badge>
            )}
          </div>
          
          <Progress 
            value={processingStatus === "processing" ? 50 : processingStatus === "complete" ? 100 : 0} 
            className="h-2"
          />
        </div>
        
        {/* Last Detection Details */}
        {lastDetection && lastDetection.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium">Recent Detections</h4>
            
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {lastDetection.map((detection, index) => (
                <div key={detection.id || index} className={`border rounded-md p-2 text-sm flex items-center ${detection.matchedPerson && !detection.matchedPerson.isAuthorized ? 'border-red-400 bg-red-50/40' : ''}`}>
                  {detection.matchedPerson ? (
                    <>
                      {detection.matchedPerson.isAuthorized ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{detection.matchedPerson.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {detection.matchedPerson.isAuthorized ? 'Authorized' : 'Unauthorized'}
                          {detection.matchedPerson.role && ` • ${detection.matchedPerson.role}`}
                          {detection.matchedPerson.ticketId && ` • Ticket: ${detection.matchedPerson.ticketId}`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Unrecognized Person</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {Math.round((detection.confidence || 0) * 100)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isRecognizing ? (
          <Button 
            onClick={handleStartRecognition} 
            className="flex-1 bg-primary"
          >
            <Camera className="h-4 w-4 mr-2" />
            Start Recognition
          </Button>
        ) : (
          <Button 
            onClick={handleStopRecognition} 
            variant="destructive" 
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Stop Recognition
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}