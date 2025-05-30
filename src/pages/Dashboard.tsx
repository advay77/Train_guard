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
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
          {user?.role === "tte" ? "Security Dashboard" : "Train Status"}
        </h1>
        <p className="text-muted-foreground text-base font-medium">
          {user?.role === "tte"
            ? "Monitor real-time security alerts and train status"
            : "View your train's location and status information"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full bg-gradient-to-br from-blue-950/80 via-blue-900/80 to-blue-800/80 rounded-2xl shadow-2xl border border-blue-900/40 p-4">
          <Tabs defaultValue="train" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="mb-4 bg-blue-950/60 rounded-xl shadow border border-blue-900/30">
                <TabsTrigger value="train" onClick={() => setViewMode("train")}
                  className="flex items-center px-6 py-2 rounded-lg transition-all duration-200 data-[state=active]:bg-blue-700/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:font-bold text-blue-200 hover:bg-blue-800/60">
                  <Train className="h-4 w-4 mr-2" />
                  Train View
                </TabsTrigger>
                <TabsTrigger value="map" onClick={() => setViewMode("map")}
                  className="flex items-center px-6 py-2 rounded-lg transition-all duration-200 data-[state=active]:bg-blue-700/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:font-bold text-blue-200 hover:bg-blue-800/60">
                  <Map className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="train" className="mt-0 animate-fade-in">
              <TrainVisualization />
            </TabsContent>

            <TabsContent value="map" className="mt-0 animate-fade-in">
              <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-950/80 via-blue-900/80 to-blue-800/80 rounded-2xl border border-blue-900/40 shadow-xl">
                <div className="text-center w-full">
                  <a href="https://fabulous-bubblegum-2138f1.netlify.app/" target="_blank" rel="noopener noreferrer">
                    <img
                      src="/1.png"
                      alt="Train Map"
                      className="mx-auto mb-4 rounded-xl shadow-2xl cursor-pointer transition-transform duration-200 hover:scale-105 border-4 border-blue-800/40"
                      style={{ maxHeight: 400, maxWidth: 600 }}
                    />
                  </a>
                  <p className="text-blue-200 font-medium text-base">Click the map to view live tracking</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Fade-in animation for tab content */}
      <style>{`.animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1); } @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
