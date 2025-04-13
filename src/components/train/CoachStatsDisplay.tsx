
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, AlertCircle } from "lucide-react";
import { CoachData } from "@/services/coachDataService";

interface CoachStatsDisplayProps {
  coachData?: CoachData;
  isSelected: boolean;
  onClick: () => void;
}

export function CoachStatsDisplay({ coachData, isSelected, onClick }: CoachStatsDisplayProps) {
  if (!coachData) return null;

  const occupancyPercentage = Math.round((coachData.occupancy / coachData.capacity) * 100);
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? "border-primary shadow-md" : "border-border/50"
      } ${coachData.unauthorizedEntries > 0 ? "border-red-500/50" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span>Coach {coachData.id}</span>
          {coachData.unauthorizedEntries > 0 && (
            <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Occupancy:</span>
          </div>
          <div className="font-medium text-right">
            {occupancyPercentage}%
          </div>
          
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Security:</span>
          </div>
          <div className="font-medium text-right">
            {coachData.unauthorizedEntries > 0 ? (
              <span className="text-red-500">{coachData.unauthorizedEntries} Alerts</span>
            ) : (
              <span className="text-green-500">Clear</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
