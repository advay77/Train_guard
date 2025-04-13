
import React, { useState } from "react";
import { TrainScene } from "@/components/three/TrainScene";
import { CoachStatsDisplay } from "@/components/train/CoachStatsDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCoachesData, getTotalStats } from "@/services/coachDataService";
import { AlertCircle, Users, Shield, Map, Train } from "lucide-react";

export function TrainVisualization() {
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const coachesData = getAllCoachesData();
  const totalStats = getTotalStats();
  
  // Calculate overall occupancy percentage
  const overallOccupancy = Math.round((totalStats.totalOccupancy / totalStats.totalCapacity) * 100);
  
  // Check if any security alerts exist
  const hasSecurityAlerts = totalStats.totalUnauthorized > 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Train Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallOccupancy}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalStats.totalOccupancy} of {totalStats.totalCapacity} seats
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-card/70 backdrop-blur-sm ${hasSecurityAlerts ? 'border-red-500/50' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertCircle className={`h-4 w-4 mr-2 ${hasSecurityAlerts ? 'text-red-500' : 'text-primary'}`} />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasSecurityAlerts ? 'text-red-500' : ''}`}>
              {totalStats.totalUnauthorized}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasSecurityAlerts ? 'Unauthorized entries detected' : 'No alerts'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              Security Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">
              Today's total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3D Visualization with enhanced title */}
      <Card className="bg-card/70 backdrop-blur-sm overflow-hidden border border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center">
            <Train className="h-5 w-5 mr-2 text-primary" />
            3D Train Visualization
          </CardTitle>
          <CardDescription>
            Real-time 3D view of train coaches with security and occupancy data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TrainScene />
        </CardContent>
      </Card>

      {/* Coach Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {coachesData.map((coach) => (
          <CoachStatsDisplay
            key={coach.id}
            coachData={coach}
            isSelected={selectedCoach === coach.id}
            onClick={() => setSelectedCoach(selectedCoach === coach.id ? null : coach.id)}
          />
        ))}
      </div>
    </div>
  );
}
