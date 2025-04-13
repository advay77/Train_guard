
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  Lock, 
  Save, 
  Shield, 
  Smartphone, 
  User 
} from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notifications, setNotifications] = useState({
    securityAlerts: true,
    bookingUpdates: true,
    marketingEmails: false,
    appNotifications: true,
    smsNotifications: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    rememberDevices: true,
    activityLogs: true
  });
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (settingGroup: "notifications" | "securitySettings", name: string, checked: boolean) => {
    if (settingGroup === "notifications") {
      setNotifications(prev => ({ ...prev, [name]: checked }));
    } else {
      setSecuritySettings(prev => ({ ...prev, [name]: checked }));
    }
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    // In a real app, send this to your API
    console.log("Changing password:", passwordData);
    toast.success("Password updated successfully");
    
    // Reset form
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };
  
  const handleNotificationSave = () => {
    // In a real app, send this to your API
    console.log("Saving notification settings:", notifications);
    toast.success("Notification preferences saved");
  };
  
  const handleSecuritySave = () => {
    // In a real app, send this to your API
    console.log("Saving security settings:", securitySettings);
    toast.success("Security settings updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Basic information about your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Name</Label>
                  <Input id="username" value={user?.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Input 
                  id="role" 
                  value={user?.role === "tte" ? "Train Ticket Examiner" : "Passenger"} 
                  disabled 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what types of emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="securityAlerts">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about security incidents and unauthorized access attempts
                  </p>
                </div>
                <Switch 
                  id="securityAlerts" 
                  checked={notifications.securityAlerts}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "securityAlerts", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bookingUpdates">Booking Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your train bookings, schedule changes, and platform information
                  </p>
                </div>
                <Switch 
                  id="bookingUpdates" 
                  checked={notifications.bookingUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "bookingUpdates", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive special offers, promotions, and updates about new features
                  </p>
                </div>
                <Switch 
                  id="marketingEmails" 
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "marketingEmails", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Mobile Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications on your mobile device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appNotifications">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications within the app
                  </p>
                </div>
                <Switch 
                  id="appNotifications" 
                  checked={notifications.appNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "appNotifications", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important alerts via SMS
                  </p>
                </div>
                <Switch 
                  id="smsNotifications" 
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "smsNotifications", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNotificationSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure additional security measures for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account with 2FA
                  </p>
                </div>
                <Switch 
                  id="twoFactorAuth" 
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSwitchChange("securitySettings", "twoFactorAuth", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="biometricLogin">Biometric Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or face recognition to log in on supported devices
                  </p>
                </div>
                <Switch 
                  id="biometricLogin" 
                  checked={securitySettings.biometricLogin}
                  onCheckedChange={(checked) => handleSwitchChange("securitySettings", "biometricLogin", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rememberDevices">Remember Devices</Label>
                  <p className="text-sm text-muted-foreground">
                    Stay logged in on trusted devices
                  </p>
                </div>
                <Switch 
                  id="rememberDevices" 
                  checked={securitySettings.rememberDevices}
                  onCheckedChange={(checked) => handleSwitchChange("securitySettings", "rememberDevices", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activityLogs">Activity Logs</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep a record of account activity for security purposes
                  </p>
                </div>
                <Switch 
                  id="activityLogs" 
                  checked={securitySettings.activityLogs}
                  onCheckedChange={(checked) => handleSwitchChange("securitySettings", "activityLogs", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Smartphone className="h-4 w-4 mr-2" />
                Manage Devices
              </Button>
              <Button onClick={handleSecuritySave}>
                <Shield className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
