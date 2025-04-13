import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  User, 
  AlertTriangle, 
  Loader2, 
  Shield, 
  RefreshCw,
  UserPlus,
  Users
} from "lucide-react";
import { toast } from 'sonner';
import { WebcamCapture } from "./WebcamCapture";
import { FaceApiService } from "@/services/faceApiService";
import { getAllCoachesData, setFacialRecognitionActive, updateCoachSecurityStatus } from "@/services/coachDataService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaceData } from "@/services/facialRecognitionService";

interface RecognitionResult {
  id: string;
  name: string;
  isAuthorized: boolean;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  role?: string;
  ticketId?: string;
  timestamp?: string;
}

export function EnhancedFacialRecognition() {
  // References
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceApiService = FaceApiService.getInstance();
  
  // Component state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [results, setResults] = useState<RecognitionResult[]>([]);
  const [selectedCoach, setSelectedCoach] = useState("A1");
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "complete">("idle");
  const [showDrawing, setShowDrawing] = useState(true);
  const [captureNewFace, setCaptureNewFace] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("passenger");
  const [newPersonTicketId, setNewPersonTicketId] = useState("");
  const [unauthorizedCount, setUnauthorizedCount] = useState(0);
  const [detectionsLog, setDetectionsLog] = useState<RecognitionResult[]>([]);

  // Get coaches data
  const coachesData = getAllCoachesData();
  
  // Initialize face API
  useEffect(() => {
    const initializeFaceApi = async () => {
      try {
        const success = await faceApiService.initialize();
        setIsInitialized(success);
        
        if (success) {
          // Load models directory must be accessible
          console.log("Face API initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing face API:", error);
        toast.error("Failed to initialize facial recognition");
      }
    };

    initializeFaceApi();
  }, []);

  // Recognition interval
  useEffect(() => {
    let recognitionInterval: number | null = null;
    
    if (isRecognizing && webcamRef.current && webcamRef.current.video) {
      // Start continuous recognition
      recognitionInterval = window.setInterval(async () => {
        try {
          await runRecognition();
        } catch (error) {
          console.error("Error in recognition interval:", error);
        }
      }, 1000); // Run every second
    }

    // Clean up interval on unmount or when recognition stops
    return () => {
      if (recognitionInterval) {
        window.clearInterval(recognitionInterval);
      }
    };
  }, [isRecognizing]);

  // Handle coach selection
  const handleCoachChange = (value: string) => {
    if (isRecognizing) {
      stopRecognition();
    }
    setSelectedCoach(value);
  };

  // Start recognition
  const startRecognition = async () => {
    if (!isInitialized) {
      toast.error("Facial recognition system not initialized");
      return;
    }

    if (!webcamRef.current || !webcamRef.current.video) {
      toast.error("Webcam not available");
      return;
    }

    setIsRecognizing(true);
    setProcessingStatus("processing");
    setFacialRecognitionActive(selectedCoach, true);
    toast.success(`Facial recognition started for coach ${selectedCoach}`);
    
    // Run initial recognition
    await runRecognition();
  };

  // Stop recognition
  const stopRecognition = () => {
    setIsRecognizing(false);
    setProcessingStatus("idle");
    setFacialRecognitionActive(selectedCoach, false);
    toast.info("Facial recognition stopped");
  };

  // Run a single recognition cycle
  const runRecognition = async () => {
    if (!webcamRef.current || !webcamRef.current.video || !canvasRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Make sure video is playing
    if (video.paused || video.ended) {
      return;
    }

    setProcessingStatus("processing");

    try {
      // Run face detection and recognition
      const result = await faceApiService.detectAndRecognizeFaces(video);
      
      // Process results
      const recognitionResults: RecognitionResult[] = result.recognizedPersons.map((person, index) => {
        const box = person.detection.box;
        
        return {
          id: `detection-${Date.now()}-${index}`,
          name: person.person?.name || 'Unknown',
          isAuthorized: person.person?.isAuthorized || false,
          boundingBox: {
            x: box.x / video.videoWidth,
            y: box.y / video.videoHeight,
            width: box.width / video.videoWidth,
            height: box.height / video.videoHeight
          },
          confidence: 1 - person.distance, // Convert distance to confidence (1 - distance)
          role: person.person?.role,
          ticketId: person.person?.ticketId
        };
      });

      // Update results
      setResults(recognitionResults);
      
      // Draw results on canvas if enabled
      if (showDrawing) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Draw detection boxes
          recognitionResults.forEach(detection => {
            const { x, y, width, height } = detection.boundingBox;
            const actualX = x * canvas.width;
            const actualY = y * canvas.height;
            const actualWidth = width * canvas.width;
            const actualHeight = height * canvas.height;
            
            // Draw box
            ctx.lineWidth = 2;
            
            if (detection.isAuthorized) {
              ctx.strokeStyle = 'green';
            } else if (detection.name !== 'Unknown') {
              ctx.strokeStyle = 'red';
            } else {
              ctx.strokeStyle = 'yellow';
            }
            
            ctx.strokeRect(actualX, actualY, actualWidth, actualHeight);
            
            // Draw label background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(actualX, actualY - 20, actualWidth, 20);
            
            // Draw label text
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.fillText(
              `${detection.name} ${Math.round(detection.confidence * 100)}%`, 
              actualX + 5, 
              actualY - 5
            );
          });
        }
      }

      // Check for unauthorized entries
      const unauthorizedEntries = recognitionResults.filter(
        result => result.name !== 'Unknown' && !result.isAuthorized
      );
      
      if (unauthorizedEntries.length > 0) {
        // Update coach security status
        updateCoachSecurityStatus(selectedCoach, true);
        
        // Increment unauthorized count
        setUnauthorizedCount(prev => prev + unauthorizedEntries.length);
        
        // Add to detections log (keep only unique entries based on name)
        unauthorizedEntries.forEach(entry => {
          setDetectionsLog(prev => {
            // Check if this person is already in the log
            const exists = prev.some(item => item.name === entry.name);
            if (!exists) {
              // Add timestamp to entry
              const entryWithTimestamp = {
                ...entry,
                timestamp: new Date().toISOString()
              };
              return [entryWithTimestamp, ...prev].slice(0, 50); // Keep last 50 entries
            }
            return prev;
          });
        });
        
        // Show alert for first unauthorized entry
        unauthorizedEntries.forEach(entry => {
          toast.error(`Security Alert: Unauthorized person detected - ${entry.name}`, {
            duration: 5000
          });
        });
      }

      setProcessingStatus("complete");
      
      // Reset to processing after delay
      setTimeout(() => {
        if (isRecognizing) {
          setProcessingStatus("processing");
        }
      }, 500);
    } catch (error) {
      console.error("Error in face recognition:", error);
      setProcessingStatus("idle");
    }
  };

  // Handle image capture for enrollment
  const handleCaptureForEnrollment = async (imageSrc: string) => {
    if (!newPersonName.trim()) {
      toast.error("Please enter a name for the person");
      return;
    }

    try {
      // Convert data URL to image
      const img = new Image();
      img.src = imageSrc;
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create new person object
      const newPerson: FaceData = {
        faceId: `face-${Date.now()}`,
        name: newPersonName,
        isAuthorized: true,
        role: newPersonRole as any,
        ticketId: newPersonTicketId || undefined
      };

      // Add face to recognition database
      const success = await faceApiService.addPersonFace(newPerson, img);
      
      if (success) {
        toast.success(`${newPersonName} added to authorized personnel database`);
        // Reset form
        setNewPersonName("");
        setNewPersonRole("passenger");
        setNewPersonTicketId("");
        setCaptureNewFace(false);
      } else {
        toast.error("Failed to add face. Please try again with a clearer image.");
      }
    } catch (error) {
      console.error("Error enrolling face:", error);
      toast.error("Error enrolling face. Please try again.");
    }
  };

  // Reset security alerts
  const resetAlerts = () => {
    setUnauthorizedCount(0);
    setDetectionsLog([]);
  };

  // Count registered faces
  const registeredFacesCount = faceApiService.getRegisteredFacesCount();

  return (
    <div className="space-y-6">
      {/* Alert for unauthorized entries */}
      {unauthorizedCount > 0 && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alert</AlertTitle>
          <AlertDescription>
            {unauthorizedCount} unauthorized {unauthorizedCount === 1 ? 'person has' : 'people have'} been detected.
          </AlertDescription>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={resetAlerts}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Reset Alerts
            </Button>
          </div>
        </Alert>
      )}

      {/* Main tabs for recognition controls */}
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="live" className="flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Live Recognition
          </TabsTrigger>
          <TabsTrigger value="enroll" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll New Person
          </TabsTrigger>
          <TabsTrigger value="detections" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Unauthorized Detections
          </TabsTrigger>
        </TabsList>

        {/* Live Recognition Tab */}
        <TabsContent value="live" className="mt-0 space-y-4">
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2 text-primary" />
                Real-time Facial Recognition 
                <Badge variant="outline" className="ml-2 bg-primary/10">ResNet</Badge>
              </CardTitle>
              <CardDescription>
                Monitor and identify individuals in real-time using facial recognition
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
              
              {/* Webcam and recognition display */}
              <div className="relative bg-black rounded-md overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  className="w-full"
                  mirrored
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user"
                  }}
                />
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ display: showDrawing ? 'block' : 'none' }}
                />
                
                {/* Status overlay */}
                {!isInitialized && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>Initializing facial recognition models...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Recognition status */}
              <div>
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
              
              {/* Stats summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {results.filter(r => r.isAuthorized).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Authorized</div>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
                  <XCircle className="h-8 w-8 text-red-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {results.filter(r => r.name !== 'Unknown' && !r.isAuthorized).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Unauthorized</div>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
                  <User className="h-8 w-8 text-muted-foreground mb-2" />
                  <div className="text-2xl font-bold">
                    {results.filter(r => r.name === 'Unknown').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Unrecognized</div>
                </div>
              </div>
              
              {/* Recognition results */}
              {results.length > 0 && (
                <div className="mt-4 border rounded-md divide-y">
                  <div className="p-2 bg-muted/30 font-medium">
                    Recent Detections
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {results.map((result) => (
                      <div key={result.id} className="p-3 flex items-center gap-3">
                        {result.isAuthorized ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : result.name !== 'Unknown' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Confidence: {Math.round(result.confidence * 100)}%
                            {result.role && ` • ${result.role}`}
                            {result.ticketId && ` • Ticket: ${result.ticketId}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {/* Recognition controls */}
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowDrawing(!showDrawing)}
                >
                  {showDrawing ? 'Hide Overlay' : 'Show Overlay'}
                </Button>
                
                {!isRecognizing ? (
                  <Button 
                    onClick={startRecognition} 
                    className="flex-1 bg-primary"
                    disabled={!isInitialized}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Recognition
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecognition} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Stop Recognition
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Enroll New Person Tab */}
        <TabsContent value="enroll" className="mt-0 space-y-4">
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-primary" />
                Enroll New Person
              </CardTitle>
              <CardDescription>
                Add a new person to the facial recognition database
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Registration form */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter full name" 
                    value={newPersonName}
                    onChange={e => setNewPersonName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newPersonRole}
                    onValueChange={setNewPersonRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passenger">Passenger</SelectItem>
                      <SelectItem value="tte">Train Ticket Examiner</SelectItem>
                      <SelectItem value="security">Security Personnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newPersonRole === "passenger" && (
                  <div className="grid gap-2">
                    <Label htmlFor="ticketId">Ticket ID</Label>
                    <Input
                      id="ticketId"
                      placeholder="Enter ticket ID"
                      value={newPersonTicketId}
                      onChange={e => setNewPersonTicketId(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <h4 className="text-sm font-medium">Face Image</h4>
                    <p className="text-xs text-muted-foreground">
                      Capture a clear image of your face
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCaptureNewFace(true)}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Capture Face
                  </Button>
                </div>
                
                {/* Database stats */}
                <div className="bg-muted/20 p-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm">Database Statistics</span>
                  </div>
                  <div className="text-sm">
                    {registeredFacesCount} registered {registeredFacesCount === 1 ? 'face' : 'faces'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Face capture dialog */}
          <Dialog open={captureNewFace} onOpenChange={setCaptureNewFace}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Capture Face Image</DialogTitle>
                <DialogDescription>
                  Position your face in the center of the frame and take a clear photo
                </DialogDescription>
              </DialogHeader>
              <WebcamCapture
                onCapture={handleCaptureForEnrollment}
                width={400}
                height={300}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Unauthorized Detections Tab */}
        <TabsContent value="detections" className="mt-0">
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Unauthorized Detections
                </CardTitle>
                <CardDescription>
                  History of unauthorized individuals detected by facial recognition
                </CardDescription>
              </div>
              
              {detectionsLog.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetAlerts}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Clear Log
                </Button>
              )}
            </CardHeader>
            
            <CardContent>
              {detectionsLog.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {detectionsLog.map((detection) => (
                    <div key={detection.id} className="p-3 flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{detection.name}</span>
                          <Badge variant="destructive">Unauthorized</Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          Confidence: {Math.round(detection.confidence * 100)}%
                          {detection.role && ` • ${detection.role}`}
                          {detection.timestamp && ` • ${new Date(detection.timestamp).toLocaleTimeString()}`}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Coach: {selectedCoach}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No unauthorized detections logged</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 