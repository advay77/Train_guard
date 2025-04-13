
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Bell, 
  Check, 
  ChevronRight, 
  Clock, 
  MapPin,
  UserX 
} from "lucide-react";

// Mock data for alerts
const mockAlerts = [
  {
    id: "alert-1",
    type: "unauthorized",
    timestamp: "10:32 AM",
    location: "Coach B-3, Seat 42",
    description: "Unauthorized person detected without valid ticket",
    status: "active",
    priority: "high"
  },
  {
    id: "alert-2",
    type: "match_failed",
    timestamp: "09:45 AM",
    location: "Coach A-2, Seat 15",
    description: "ID verification failed - Photo doesn't match passenger",
    status: "active",
    priority: "high"
  },
  {
    id: "alert-3",
    type: "suspicious",
    timestamp: "08:17 AM",
    location: "Coach C-1, Entrance",
    description: "Suspicious behavior detected near coach entrance",
    status: "active",
    priority: "medium"
  },
  {
    id: "alert-4",
    type: "unauthorized",
    timestamp: "Yesterday, 4:22 PM",
    location: "Coach D-1, Seat 7",
    description: "Unauthorized access attempt at restricted area",
    status: "resolved",
    priority: "high"
  },
  {
    id: "alert-5",
    type: "match_failed",
    timestamp: "Yesterday, 2:15 PM",
    location: "Coach B-2, Seat 23",
    description: "ID verification failed - Expired identification document",
    status: "resolved",
    priority: "medium"
  }
];

export function NotificationsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  
  const handleResolveAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: "resolved" } 
          : alert
      )
    );
  };
  
  const activeAlerts = alerts.filter(alert => alert.status === "active");
  const resolvedAlerts = alerts.filter(alert => alert.status === "resolved");
  
  const renderAlertIcon = (type: string) => {
    switch(type) {
      case "unauthorized":
        return <UserX className="h-5 w-5 text-alert" />;
      case "match_failed":
        return <AlertTriangle className="h-5 w-5 text-alert" />;
      case "suspicious":
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };
  
  const renderPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Security Notifications</h1>
        <p className="text-muted-foreground">
          Monitor and respond to real-time security alerts
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Alert Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-alert" />
                <span>Active Alerts</span>
              </div>
              <Badge variant="destructive">{activeAlerts.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-md">
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-success" />
                <span>Resolved</span>
              </div>
              <Badge variant="outline">{resolvedAlerts.length}</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Alert Types</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserX className="h-3 w-3 mr-1 text-alert" />
                    <span>Unauthorized</span>
                  </div>
                  <span>{alerts.filter(a => a.type === "unauthorized").length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-alert" />
                    <span>ID Mismatch</span>
                  </div>
                  <span>{alerts.filter(a => a.type === "match_failed").length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-3 w-3 mr-1 text-yellow-500" />
                    <span>Suspicious</span>
                  </div>
                  <span>{alerts.filter(a => a.type === "suspicious").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="h-5 w-5 mr-2 text-alert" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Security incidents requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activeAlerts.length > 0 ? (
              <div className="divide-y divide-border/50">
                {activeAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-4 hover:bg-secondary/30 transition-colors ${alert.priority === 'high' ? 'border-l-4 border-alert' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          {renderAlertIcon(alert.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">
                              {alert.type === "unauthorized" 
                                ? "Unauthorized Access" 
                                : alert.type === "match_failed" 
                                  ? "ID Verification Failed" 
                                  : "Suspicious Activity"}
                            </h3>
                            {renderPriorityBadge(alert.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {alert.timestamp}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {alert.location}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Check className="h-8 w-8 text-success mx-auto mb-2" />
                <h3 className="font-medium text-lg">All Clear</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  No active alerts at the moment
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Check className="h-5 w-5 mr-2 text-success" />
            Recently Resolved
          </CardTitle>
          <CardDescription>
            Alerts that have been addressed
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {resolvedAlerts.map(alert => (
              <div 
                key={alert.id} 
                className="p-4 hover:bg-secondary/30 transition-colors opacity-70"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="pt-0.5">
                      {renderAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          {alert.type === "unauthorized" 
                            ? "Unauthorized Access" 
                            : alert.type === "match_failed" 
                              ? "ID Verification Failed" 
                              : "Suspicious Activity"}
                        </h3>
                        <Badge variant="outline">Resolved</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {alert.timestamp}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {alert.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
