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
  const [isSwitching, setIsSwitching] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);

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

  // Reset error when switching device
  useEffect(() => {
    setCameraError(false);
  }, [selectedDeviceId]);

  // Mark webcam as ready when video stream is available
  const handleUserMedia = useCallback(() => {
    setWebcamReady(true);
  }, []);

  // Mark webcam as not ready on error
  const handleCameraError = useCallback((error: string | DOMException) => {
    if (!cameraError) {
      setWebcamReady(false);
      setCameraError(true);
      toast.error("Could not access camera. Please check permissions.");
    }
  }, [cameraError]);

  // Capture image from webcam, retry up to 3 times if needed
  const captureImage = useCallback(async () => {
    if (!webcamReady) {
      toast.error("Webcam not ready. Please wait a moment.");
      return;
    }
    if (webcamRef.current) {
      let imageSrc = null;
      for (let i = 0; i < 3; i++) {
        imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) break;
        await new Promise(res => setTimeout(res, 150));
      }
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        toast.error("Failed to capture image. Please try again.");
      }
    }
  }, [webcamRef, webcamReady]);

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
    setIsSwitching(true);
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    setSelectedDeviceId(availableDevices[nextIndex].deviceId);
    setTimeout(() => setIsSwitching(false), 500);
    toast.info(`Switched to: ${availableDevices[nextIndex].label || 'Camera ' + (nextIndex + 1)}`);
  }, [availableDevices, selectedDeviceId]);

  // Video constraints
  const videoConstraints = {
    width,
    height,
    facingMode: "user",
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
  };

  return (
    <Card className={cn("overflow-hidden shadow-lg border-2 border-primary/30", className)}>
      <CardHeader className="p-3 bg-gradient-to-r from-blue-900/80 to-blue-700/60">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-blue-100/90">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex flex-col items-center bg-black/10">
        {/* Camera device selector */}
        {availableDevices.length > 1 && !capturedImage && !cameraError && (
          <div className="w-full flex justify-center py-2 gap-2">
            <select
              className="rounded border px-2 py-1 text-sm bg-white/80"
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              disabled={isSwitching}
            >
              {availableDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={switchCamera} disabled={isSwitching}>
              <RefreshCw className={cn("h-4 w-4 mr-1", isSwitching && "animate-spin")} />
              Switch
            </Button>
          </div>
        )}
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
              className="object-contain rounded-lg border border-primary/30 shadow-md"
              style={{ width, height }}
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded shadow">
              Preview
            </div>
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
              onUserMedia={handleUserMedia}
              onUserMediaError={handleCameraError}
              className="object-contain rounded-lg border border-primary/20 shadow"
              mirrored
            />
            {/* Face position guide overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center justify-center">
              <div className="w-2/3 h-2/3 border-4 border-dashed border-primary/60 rounded-full flex items-center justify-center relative">
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary/80 bg-white/70 px-2 py-0.5 rounded shadow">
                  Center your face here
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {showControls && (
        <CardFooter className="flex justify-between p-3 gap-2 bg-gradient-to-r from-blue-900/10 to-blue-700/10">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={retakeImage} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button onClick={acceptImage} className="flex-1 bg-primary text-white">
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </>
          ) : (
            <>
              <Button onClick={captureImage} className="flex-1 bg-primary text-white" disabled={!webcamReady || isSwitching}>
                <Camera className="h-4 w-4 mr-2" />
                {webcamReady ? "Capture" : "Loading..."}
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}