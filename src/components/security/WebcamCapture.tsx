import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Camera, Check, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  width?: number;
  height?: number;
  className?: string;
  showControls?: boolean;
  title?: string;
  description?: string;
}

export function WebcamCapture({
  onCapture,
  width = 400,
  height = 300,
  className,
  showControls = true,
  title = "Capture Face Image",
  description = "Position your face in the center of the frame",
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Get available camera devices
  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const videoDevices = mediaDevices.filter(({ kind }) => kind === 'videoinput');
    setAvailableDevices(videoDevices);
    
    // Set the first available camera as default if not already set
    if (videoDevices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [selectedDeviceId]);

  // Initialize camera and get devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(handleDevices)
      .catch(error => {
        console.error("Error accessing media devices:", error);
        setCameraError(true);
        toast.error("Could not access camera devices");
      });
  }, [handleDevices]);

  // Handle camera errors
  const handleCameraError = useCallback((error: string | DOMException) => {
    console.error("Webcam error:", error);
    setCameraError(true);
    toast.error("Could not access camera. Please check permissions.");
  }, []);

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        toast.error("Failed to capture image");
      }
    }
  }, [webcamRef]);

  // Accept the captured image
  const acceptImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  }, [capturedImage, onCapture]);

  // Retake the image
  const retakeImage = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Switch camera device
  const switchCamera = useCallback(() => {
    if (availableDevices.length <= 1) {
      toast.info("No other cameras available");
      return;
    }
    
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    setSelectedDeviceId(availableDevices[nextIndex].deviceId);
    toast.info("Camera switched");
  }, [availableDevices, selectedDeviceId]);

  // Video constraints
  const videoConstraints = {
    width,
    height,
    facingMode: "user",
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-3">
        <CardTitle className="text-lg flex items-center">
          <Camera className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 flex justify-center bg-black/5">
        {cameraError ? (
          <div className="flex items-center justify-center text-center p-8 h-[300px]">
            <div className="text-destructive space-y-2">
              <XCircle className="h-10 w-10 mx-auto" />
              <p className="font-medium">Camera access error</p>
              <p className="text-sm text-muted-foreground">
                Please check your camera permissions and ensure no other app is using the camera.
              </p>
              <Button variant="outline" onClick={() => setCameraError(false)}>
                Try Again
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="object-contain"
              style={{ width, height }}
            />
          </div>
        ) : (
          <div className="relative">
            <Webcam
              audio={false}
              height={height}
              width={width}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleCameraError}
              className="object-contain"
              mirrored
            />
            {/* Face position guide overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
              <div className="w-1/2 h-1/2 mx-auto my-auto border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center">
                <div className="text-xs text-primary/70 text-center px-2">
                  Center face here
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {showControls && (
        <CardFooter className="flex justify-between p-3 gap-2">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={retakeImage} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button onClick={acceptImage} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </>
          ) : (
            <>
              {availableDevices.length > 1 && (
                <Button variant="outline" onClick={switchCamera} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
              )}
              <Button onClick={captureImage} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 