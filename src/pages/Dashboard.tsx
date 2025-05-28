import React, { useState } from "react";
import { TrainVisualization } from "@/components/train/TrainVisualization";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Train, Map } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"train" | "map">("train");

  return (
    <div className="space-y-8 px-2 sm:px-0">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight transition-colors duration-300">
          {user?.role === "tte" ? "Security Dashboard" : "Train Status"}
        </h1>
        <p className="text-muted-foreground text-base transition-colors duration-300">
          {user?.role === "tte"
            ? "Monitor real-time security alerts and train status"
            : "View your train's location and status information"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs defaultValue="train" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="mb-4">
              <TabsTrigger value="train" onClick={() => setViewMode("train")}
                className="flex items-center transition-colors duration-200 data-[state=active]:underline data-[state=active]:font-semibold">
                <Train className="h-4 w-4 mr-2" />
                Train View
              </TabsTrigger>
              <TabsTrigger value="map" onClick={() => setViewMode("map")}
                className="flex items-center transition-colors duration-200 data-[state=active]:underline data-[state=active]:font-semibold">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="train" className="mt-0 animate-fade-in">
            <TrainVisualization />
          </TabsContent>

          <TabsContent value="map" className="mt-0 animate-fade-in">
            <div className="h-[600px] flex items-center justify-center bg-card/70 rounded-lg border border-border/50">
              <div className="text-center">
                <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Map view is currently under development</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <a
          href="https://fabulous-bubblegum-2138f1.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 self-start sm:self-auto transition-transform duration-200 hover:scale-105"
        >
          View Map
        </a>
      </div>
      {/* Fade-in animation for tab content */}
      <style>{`.animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1); } @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
