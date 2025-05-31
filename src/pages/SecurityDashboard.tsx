import React from "react";
import { EnhancedFacialRecognition } from "@/components/security/EnhancedFacialRecognition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SecurityDashboard() {
  const { user } = useAuth();

  // Example stats (replace with real data if available)
  const todayAlerts = 5;
  const enrolledFaces = 18;

  return (
    <div className="space-y-8 px-2 sm:px-0">
      {/* IRCTC-style header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/placeholder.svg" alt="IRCTC Logo" className="h-12 w-12 rounded-full bg-white/80 shadow border border-blue-900/30" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
              Security Dashboard
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Monitor and manage train security using facial recognition
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/dashboard#facial-recognition" className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold shadow hover:bg-gray-800 transition-all flex items-center gap-2">
            Back to Dashboard
          </a>
          <a href="/logs?filter=unauthorized_access" className="px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition-all flex items-center gap-2">
            <Camera className="h-4 w-4" />
            View Logs
          </a>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-900/20 via-blue-900/20 to-blue-800/20 rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-red-600/20 rounded-full p-3">
            <Camera className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-700">{todayAlerts}</div>
            <div className="text-sm text-red-900/80 font-medium flex items-center gap-2">
              Today's Security Alerts
              <a href="/logs?filter=unauthorized_access" className="underline text-blue-700 hover:text-blue-900 text-xs">See Unauthorized</a>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 via-blue-900/20 to-blue-800/20 rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-green-600/20 rounded-full p-3">
            <Camera className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{enrolledFaces}</div>
            <div className="text-sm text-green-900/80 font-medium">Enrolled Faces</div>
          </div>
        </div>
      </div>

      {/* Info/Help section */}
      <div className="bg-gradient-to-br from-blue-950/80 via-blue-900/80 to-blue-800/80 rounded-2xl shadow-xl border border-blue-900/40 p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <Alert variant="default" className="bg-primary/10 border-primary/20">
            <Camera className="h-4 w-4 text-primary" />
            <AlertTitle>Enhanced Facial Recognition Active</AlertTitle>
            <AlertDescription>
              This system uses a pre-trained ResNet model for accurate facial recognition.<br />
              <span className="font-semibold">Tip:</span> You can enroll your own face in the system for testing.<br />
              <span className="font-semibold">IRCTC Security:</span> All data is processed securely and only authorized personnel can access sensitive information.
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="bg-blue-900/30 rounded-lg p-4 text-blue-100 text-sm shadow">
            <span className="font-bold text-blue-300">Need Help?</span><br />
            For support, contact the IRCTC security team at <a href="mailto:support@irctc.co.in" className="underline text-blue-200">support@irctc.co.in</a> or call 139.
          </div>
          <div className="bg-blue-900/30 rounded-lg p-4 text-blue-100 text-sm shadow">
            <span className="font-bold text-blue-300">Security Best Practices</span><br />
            - Always verify alerts before taking action.<br />
            - Regularly update enrolled personnel.<br />
            - Report suspicious activity immediately.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <EnhancedFacialRecognition />
    </div>
  );
}