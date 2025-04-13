
import React, { useState } from "react";
import { TrainVisualization } from "@/components/train/TrainVisualization";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Train, Map } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"train" | "map">("train");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.role === "tte" ? "Security Dashboard" : "Train Status"}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "tte" 
            ? "Monitor real-time security alerts and train status" 
            : "View your train's location and status information"}
        </p>
      </div>

      <Tabs defaultValue="train" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="train" onClick={() => setViewMode("train")} className="flex items-center">
            <Train className="h-4 w-4 mr-2" />
            Train View
          </TabsTrigger>
          <TabsTrigger value="map" onClick={() => setViewMode("map")} className="flex items-center">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="train" className="mt-0">
          <TrainVisualization />
        </TabsContent>
        
        <TabsContent value="map" className="mt-0">
          <div className="h-[600px] flex items-center justify-center bg-card/70 rounded-lg border border-border/50">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Map view is currently under development</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
