import React from "react";
import { EnhancedFacialRecognition } from "@/components/security/EnhancedFacialRecognition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SecurityDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Security Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage train security using facial recognition
        </p>
      </div>
      
      <Alert variant="default" className="bg-primary/10 border-primary/20">
        <Camera className="h-4 w-4 text-primary" />
        <AlertTitle>Enhanced Facial Recognition Active</AlertTitle>
        <AlertDescription>
          This system uses a pre-trained ResNet model for accurate facial recognition. 
          You can enroll your own face in the system for testing.
        </AlertDescription>
      </Alert>
      
      {/* Main Content */}
      <EnhancedFacialRecognition />
    </div>
  );
} 