import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  CalendarDays, 
  Check, 
  Clock, 
  Edit, 
  MapPin, 
  Save, 
  Ticket, 
  UserCircle 
} from "lucide-react";

// Mock booking data
const availableTickets = [
  {
    id: "ticket-1",
    trainNumber: "Express 2408",
    from: "New Delhi",
    to: "Mumbai Central",
    departureDate: "Apr 15, 2025",
    departureTime: "08:30 AM",
    class: "First Class",
    seat: "A-12",
    status: "available"
  },
  {
    id: "ticket-2",
    trainNumber: "Shatabdi 12026",
    from: "Bengaluru",
    to: "Chennai",
    departureDate: "Apr 20, 2025",
    departureTime: "06:15 AM",
    class: "Business",
    seat: "B-07",
    status: "available"
  },
  {
    id: "ticket-3",
    trainNumber: "Rajdhani 12310",
    from: "Kolkata",
    to: "New Delhi",
    departureDate: "May 02, 2025",
    departureTime: "04:45 PM",
    class: "Economy",
    seat: "D-23",
    status: "available"
  }
];

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem("profileData");
    if (saved) return JSON.parse(saved);
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone: "+91 98765 43210",
      address: "123 Railway Colony, New Delhi",
      idNumber: "ABCDE1234F"
    };
  });
  const [photoPreview, setPhotoPreview] = React.useState(() => {
    const saved = localStorage.getItem("profilePhoto");
    return saved || null;
  });

  // Save profileData to localStorage on change
  React.useEffect(() => {
    localStorage.setItem("profileData", JSON.stringify(profileData));
  }, [profileData]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
    // Save to localStorage already handled by useEffect
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
          localStorage.setItem("profilePhoto", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile and bookings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card/70">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Profile</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview || user?.photoUrl || "/placeholder.svg"} alt={user?.name || "Profile"} />
                  <AvatarFallback>
                    <UserCircle className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label htmlFor="profile-photo-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer border border-gray-200">
                    <Input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <Edit className="h-4 w-4 text-gray-600" />
                  </label>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-lg">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <Badge variant="outline" className="mt-2">
                  {user?.role === "tte" ? "Train Ticket Examiner" : "Passenger"}
                </Badge>
              </div>
              
              <Separator />
              
              {isEditing ? (
                <div className="w-full space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={profileData.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={profileData.address}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input 
                      id="idNumber" 
                      name="idNumber" 
                      value={profileData.idNumber}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <Button className="w-full" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{profileData.phone}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-right">{profileData.address}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Number</span>
                    <span>{profileData.idNumber}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg">Identity Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-500/10 p-3">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <h3 className="font-medium">Verified</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your identity has been verified for secure travel
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="md:col-span-2 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-primary" />
              Available Tickets
            </CardTitle>
            <CardDescription>
              Trains available from your source to destination
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {availableTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  className="p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {ticket.trainNumber}
                        <Badge variant="outline" className="ml-2 text-blue-500 border-blue-500">
                          Available
                        </Badge>
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {ticket.from} to {ticket.to}
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0 text-right">
                      <div className="flex items-center md:justify-end text-sm">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {ticket.departureDate}
                      </div>
                      <div className="flex items-center md:justify-end text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {ticket.departureTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-secondary/30 rounded-md p-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Class</span>
                        <p className="text-sm">{ticket.class}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Seat</span>
                        <p className="text-sm">{ticket.seat}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0 space-x-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
