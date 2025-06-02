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
import { updateUserProfile, changeUserPassword } from "@/services/userApiService";

export function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  // Patch: allow phone to be stored in local state, fallback to localStorage if not in user
  const initialPhone = (() => {
    if (user && typeof (user as any).phone === 'string') return (user as any).phone;
    const savedUser = localStorage.getItem("trainSecurityUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.phone) return parsed.phone;
      } catch {}
    }
    return "";
  })();
  const [accountData, setAccountData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: initialPhone
  });
  
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
  
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

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
  
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData.name || !accountData.email || !accountData.phone) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const updatedUser = await updateUserProfile(accountData);
      if (typeof updatedUser === 'object' && updatedUser !== null) {
        const { name, email, phone } = updatedUser as { name: string; email: string; phone: string };
        const newUser = {
          ...user,
          name,
          email,
          phone
        };
        localStorage.setItem("trainSecurityUser", JSON.stringify(newUser));
        setAccountData({ name, email, phone });
        toast.success("Account information updated!");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        toast.error(err.response.data.errors.map((e: any) => e.msg).join(', '));
      } else {
        toast.error(err?.response?.data?.message || "Failed to update profile");
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    try {
      await changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    }
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
    <div className="space-y-8 px-2 sm:px-0">
      {/* Modern header and summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/placeholder.svg" alt="User" className="h-12 w-12 rounded-full bg-white/80 shadow border border-blue-900/30" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
              Settings
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Dark mode toggled (demo only)')}>🌙 Dark Mode</Button>
          <Button variant="outline" onClick={() => toast.success('Your data will be downloaded (demo only)')}>⬇️ Download Data</Button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-950/80 via-blue-900/80 to-blue-800/80 rounded-2xl shadow-xl border border-blue-900/40 p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <div className="text-lg font-semibold text-blue-200 mb-2">Welcome, {user?.name || 'User'}!</div>
          <div className="text-blue-100 text-sm">Your account type: <span className="font-bold text-blue-300">{user?.role === 'tte' ? 'Train Ticket Examiner' : 'Passenger'}</span></div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="bg-blue-900/30 rounded-lg p-4 text-blue-100 text-sm shadow">
            <span className="font-bold text-blue-300">Need Help?</span><br />
            For support, contact <a href="mailto:support@irctc.co.in" className="underline text-blue-200">support@irctc.co.in</a> or call 139.
          </div>
        </div>
      </div>
      {/* Settings Tabs */}
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
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAccountSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={accountData.name} onChange={handleAccountChange} required autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={accountData.email} onChange={handleAccountChange} required autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={accountData.phone} onChange={handleAccountChange} required autoComplete="tel" />
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
              <CardFooter>
                <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit} autoComplete="off">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                    />
                    {/* Password strength meter */}
                    {passwordData.newPassword && (
                      <div className="mt-1 h-2 w-full rounded bg-gray-200 overflow-hidden">
                        <div
                          className={
                            'h-2 rounded transition-all ' +
                            (passwordData.newPassword.length > 10
                              ? 'bg-green-500 w-full'
                              : passwordData.newPassword.length > 6
                              ? 'bg-yellow-400 w-2/3'
                              : 'bg-red-500 w-1/3')
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800">
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-500 mb-2">Warning: This action cannot be undone.</p>
              <Button variant="destructive" onClick={() => toast.error('Account deletion is not available in demo.')}>Delete Account</Button>
            </CardContent>
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
          {/* New: Session Management */}
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                View and revoke active sessions/devices for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-2 rounded bg-blue-900/10">
                  <div>
                    <span className="font-semibold text-blue-900">Windows Chrome</span>
                    <span className="ml-2 text-xs text-muted-foreground">(This device)</span>
                  </div>
                  <Button size="sm" variant="outline" disabled>Active</Button>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-blue-900/5">
                  <div>
                    <span className="font-semibold text-blue-900">Android App</span>
                    <span className="ml-2 text-xs text-muted-foreground">Last active: 2 days ago</span>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => toast.success('Session revoked (demo only)')}>Revoke</Button>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-blue-900/5">
                  <div>
                    <span className="font-semibold text-blue-900">iOS App</span>
                    <span className="ml-2 text-xs text-muted-foreground">Last active: 5 days ago</span>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => toast.success('Session revoked (demo only)')}>Revoke</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
