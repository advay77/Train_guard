import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock, 
  Download, 
  FileText, 
  Filter, 
  MapPin, 
  Search, 
  Shield, 
  UserX 
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Mock security logs data
const mockSecurityLogs = [
  {
    id: "log-1",
    timestamp: "Apr 12, 2025 10:32:15",
    type: "unauthorized_access",
    location: "Coach B-3, Seat 42",
    description: "Unauthorized passenger detected without valid ticket",
    actionTaken: "Passenger escorted off at next station",
    severity: "high"
  },
  {
    id: "log-2",
    timestamp: "Apr 12, 2025 09:45:22",
    type: "id_mismatch",
    location: "Coach A-2, Seat 15",
    description: "Passenger ID verification failed - photo doesn't match",
    actionTaken: "Additional verification performed",
    severity: "medium"
  },
  {
    id: "log-3",
    timestamp: "Apr 12, 2025 08:17:40",
    type: "suspicious_activity",
    location: "Coach C-1, Entrance",
    description: "Suspicious behavior detected near coach entrance",
    actionTaken: "Area monitored, no further action required",
    severity: "low"
  },
  {
    id: "log-4",
    timestamp: "Apr 11, 2025 16:22:05",
    type: "unauthorized_access",
    location: "Coach D-1, Restricted Area",
    description: "Unauthorized access attempt at staff-only area",
    actionTaken: "Security alerted, access denied",
    severity: "high"
  },
  {
    id: "log-5",
    timestamp: "Apr 11, 2025 14:15:33",
    type: "id_mismatch",
    location: "Coach B-2, Seat 23",
    description: "ID verification failed - document expired",
    actionTaken: "Alternative identification accepted",
    severity: "low"
  },
  {
    id: "log-6",
    timestamp: "Apr 11, 2025 11:05:19",
    type: "system_event",
    location: "System Wide",
    description: "Security system reboot completed",
    actionTaken: "Normal operation resumed",
    severity: "info"
  },
  {
    id: "log-7",
    timestamp: "Apr 11, 2025 09:30:44",
    type: "suspicious_activity",
    location: "Coach A-1, Baggage Area",
    description: "Unattended baggage detected",
    actionTaken: "Baggage checked and cleared",
    severity: "medium"
  },
  {
    id: "log-8",
    timestamp: "Apr 10, 2025 18:45:12",
    type: "unauthorized_access",
    location: "Coach B-4, Seat 8",
    description: "Passenger in wrong seat",
    actionTaken: "Passenger directed to correct seat",
    severity: "low"
  }
];

// Mock access logs data
const mockAccessLogs = [
  {
    id: "access-1",
    timestamp: "Apr 12, 2025 11:45:22",
    passengerName: "John Smith",
    ticketId: "TKT-45678",
    location: "Coach A-1, Entrance",
    status: "granted"
  },
  {
    id: "access-2",
    timestamp: "Apr 12, 2025 11:40:15",
    passengerName: "Emma Johnson",
    ticketId: "TKT-45679",
    location: "Coach A-2, Entrance",
    status: "granted"
  },
  {
    id: "access-3",
    timestamp: "Apr 12, 2025 11:32:08",
    passengerName: "Unknown",
    ticketId: "Invalid",
    location: "Coach B-3, Entrance",
    status: "denied"
  },
  {
    id: "access-4",
    timestamp: "Apr 12, 2025 11:25:33",
    passengerName: "Michael Brown",
    ticketId: "TKT-45680",
    location: "Coach C-1, Entrance",
    status: "granted"
  },
  {
    id: "access-5",
    timestamp: "Apr 12, 2025 11:20:19",
    passengerName: "Sarah Davis",
    ticketId: "TKT-45681",
    location: "Coach A-2, Entrance",
    status: "granted"
  },
  {
    id: "access-6",
    timestamp: "Apr 12, 2025 11:15:54",
    passengerName: "Robert Wilson",
    ticketId: "TKT-45682",
    location: "Coach B-1, Entrance",
    status: "granted"
  },
  {
    id: "access-7",
    timestamp: "Apr 12, 2025 11:10:42",
    passengerName: "Unknown",
    ticketId: "TKT-45683",
    location: "Coach C-2, Entrance",
    status: "denied"
  },
  {
    id: "access-8",
    timestamp: "Apr 12, 2025 11:05:31",
    passengerName: "Jennifer Lee",
    ticketId: "TKT-45684",
    location: "Coach A-3, Entrance",
    status: "granted"
  }
];

export function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-filter if coming from dashboard with ?filter=unauthorized_access
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get("filter");
    if (filter) setFilterType(filter);
  }, [location.search]);

  // Summary counts
  const totalLogs = mockSecurityLogs.length;
  const unauthorizedCount = mockSecurityLogs.filter(l => l.type === "unauthorized_access").length;
  const suspiciousCount = mockSecurityLogs.filter(l => l.type === "suspicious_activity").length;
  const idMismatchCount = mockSecurityLogs.filter(l => l.type === "id_mismatch").length;

  // Filter security logs based on search and filters
  const filteredSecurityLogs = mockSecurityLogs.filter(log => {
    // Search filter
    const matchesSearch = 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionTaken.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filterType === "all" || log.type === filterType;
    
    // Severity filter
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });
  
  // Filter access logs based on search
  const filteredAccessLogs = mockAccessLogs.filter(log => {
    // Search filter
    return (
      log.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const renderSecurityLogSeverity = (severity: string) => {
    switch(severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };
  
  const renderAccessStatus = (status: string) => {
    return status === "granted" 
      ? <Badge variant="outline" className="text-green-500 border-green-500">Access Granted</Badge>
      : <Badge variant="destructive">Access Denied</Badge>;
  };
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case "unauthorized_access":
        return <UserX className="h-4 w-4 text-alert" />;
      case "id_mismatch":
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case "suspicious_activity":
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            Security Logs
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Review security incidents and access logs
          </p>
        </div>
        <Button onClick={() => navigate("/SecurityDashboard")}
          className="bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition-all flex items-center gap-2 px-4 py-2 rounded-lg">
          Back to Dashboard
        </Button>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-blue-800">{totalLogs}</span>
          <span className="text-xs text-blue-900/80">Total Logs</span>
        </div>
        <div className="bg-gradient-to-br from-red-900/20 to-blue-800/20 rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-red-700">{unauthorizedCount}</span>
          <span className="text-xs text-red-900/80">Unauthorized</span>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/20 to-blue-800/20 rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-yellow-600">{idMismatchCount}</span>
          <span className="text-xs text-yellow-900/80">ID Mismatch</span>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-blue-800/20 rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-green-700">{suspiciousCount}</span>
          <span className="text-xs text-green-900/80">Suspicious</span>
        </div>
      </div>
      
      <Card className="bg-card/70">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm hidden md:inline">Filter:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                <SelectItem value="id_mismatch">ID Mismatch</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                <SelectItem value="system_event">System Event</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security Logs</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Access Logs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card className="bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle>Security Incidents Log</CardTitle>
              <CardDescription>
                Record of security events and actions taken
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b">
                      <tr className="border-b transition-colors hover:bg-secondary/20">
                        <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Action Taken</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSecurityLogs.length > 0 ? (
                        filteredSecurityLogs.map(log => (
                          <tr
                            key={log.id}
                            className={`border-b transition-colors hover:bg-blue-900/10 ${filterType === 'unauthorized_access' && log.type === 'unauthorized_access' ? 'bg-red-900/10 font-bold' : ''}`}
                          >
                            <td className="p-4 align-middle">
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {log.timestamp.split(' ')[1]}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {log.timestamp.split(' ')[0]}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(log.type)}
                                <span>
                                  {log.type === "unauthorized_access" 
                                    ? "Unauthorized" 
                                    : log.type === "id_mismatch" 
                                      ? "ID Mismatch" 
                                      : log.type === "suspicious_activity"
                                        ? "Suspicious"
                                        : "System Event"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                {log.location}
                              </div>
                            </td>
                            <td className="p-4 align-middle">{log.description}</td>
                            <td className="p-4 align-middle">{log.actionTaken}</td>
                            <td className="p-4 align-middle">
                              {renderSecurityLogSeverity(log.severity)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="h-24 text-center">
                            No matching logs found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access" className="space-y-4 mt-6">
          <Card className="bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle>Access Control Log</CardTitle>
              <CardDescription>
                Record of passenger access to train coaches
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b">
                      <tr className="border-b transition-colors hover:bg-secondary/20">
                        <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Passenger</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Ticket ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredAccessLogs.length > 0 ? (
                        filteredAccessLogs.map(log => (
                          <tr
                            key={log.id}
                            className="border-b transition-colors hover:bg-secondary/20"
                          >
                            <td className="p-4 align-middle">
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {log.timestamp.split(' ')[1]}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {log.timestamp.split(' ')[0]}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">{log.passengerName}</td>
                            <td className="p-4 align-middle">{log.ticketId}</td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                {log.location}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              {renderAccessStatus(log.status)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="h-24 text-center">
                            No matching logs found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
