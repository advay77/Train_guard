import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, TrainFront, User, Shield, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "tte">("user");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, role);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 animate-gradient-x p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="bg-white/10 rounded-full p-3 shadow-lg mb-1 border border-white/20 backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <TrainFront className="h-12 w-12 text-blue-400 drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">3D Train Security Portal</h1>
          <p className="text-base text-blue-300">Login to access train security features</p>
        </div>

        {/* Social Login Options */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white border border-blue-800 shadow transition-all"
            onClick={async () => {
              // Google OAuth2 endpoint
              const googleClientId = "YOUR_GOOGLE_CLIENT_ID"; // TODO: Replace with your real client ID
              const redirectUri = window.location.origin + "/auth/google/callback";
              const scope = "profile email";
              const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
              window.location.href = oauthUrl;
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 6.5 28.9 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c10.7 0 20-8.2 20-20 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.7 17.1 19.5 14.5 24 14.5c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 6.5 28.9 4.5 24 4.5c-7.2 0-13.3 4.1-16.7 10.2z"/><path fill="#FBBC05" d="M24 45.5c6.1 0 11.7-2.1 16-5.7l-7.4-6.1C30.7 36.1 27.5 37.5 24 37.5c-6.1 0-11.3-4.1-13.2-9.6l-7.1 5.5C6.7 41.1 14.7 45.5 24 45.5z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.6 0-5-.8-7-2.3l-6.4 6.4C14.5 41.5 19.1 43.5 24 43.5c10.7 0 20-8.2 20-20 0-1.3-.1-2.7-.3-4z"/></g></svg>
            Sign in with Google
          </Button>
        </div>
        <div className="flex items-center my-2">
          <div className="flex-grow h-px bg-blue-900/60" />
          <span className="mx-2 text-xs text-blue-400">or</span>
          <div className="flex-grow h-px bg-blue-900/60" />
        </div>

        {/* Standard Login Tabs */}
        <Tabs defaultValue="user" className="w-full" onValueChange={(value) => setRole(value as "user" | "tte")}> 
          <TabsList className="grid w-full grid-cols-2 bg-blue-900/60 backdrop-blur rounded-lg mb-2 shadow-sm">
            <TabsTrigger value="user" className="flex items-center justify-center space-x-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover:bg-blue-800/80">
              <User className="h-4 w-4" />
              <span>Passenger</span>
            </TabsTrigger>
            <TabsTrigger value="tte" className="flex items-center justify-center space-x-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover:bg-blue-800/80">
              <Shield className="h-4 w-4" />
              <span>TTE</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card className="bg-blue-950/80 backdrop-blur-lg border border-blue-900/60 shadow-2xl rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-100">Passenger Login</CardTitle>
                <CardDescription className="text-blue-300/80">
                  Enter your credentials to access your train bookings and profile
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-200">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-blue-900/60 focus:bg-blue-900/80 border-blue-800 focus:border-blue-400 text-blue-100 placeholder:text-blue-400 transition-all focus:ring-2 focus:ring-blue-400/40"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="password" className="text-blue-200">Password</Label>
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-blue-900/60 focus:bg-blue-900/80 border-blue-800 focus:border-blue-400 text-blue-100 placeholder:text-blue-400 pr-10 transition-all focus:ring-2 focus:ring-blue-400/40"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-8 text-blue-400 hover:text-blue-200 focus:outline-none"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold shadow-lg transition-all focus:ring-2 focus:ring-blue-400/40" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="tte">
            <Card className="bg-blue-950/80 backdrop-blur-lg border border-blue-900/60 shadow-2xl rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-100">TTE Login</CardTitle>
                <CardDescription className="text-blue-300/80">
                  Enter your credentials to access security monitoring features
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tte-email" className="text-blue-200">Email</Label>
                    <Input 
                      id="tte-email" 
                      type="email" 
                      placeholder="tte.email@railways.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-blue-900/60 focus:bg-blue-900/80 border-blue-800 focus:border-blue-400 text-blue-100 placeholder:text-blue-400 transition-all focus:ring-2 focus:ring-blue-400/40"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="tte-password" className="text-blue-200">Password</Label>
                    <Input 
                      id="tte-password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-blue-900/60 focus:bg-blue-900/80 border-blue-800 focus:border-blue-400 text-blue-100 placeholder:text-blue-400 pr-10 transition-all focus:ring-2 focus:ring-blue-400/40"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-8 text-blue-400 hover:text-blue-200 focus:outline-none"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold shadow-lg transition-all focus:ring-2 focus:ring-blue-400/40" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-blue-300 mt-2">
          By signing in, you agree to our <span className="underline hover:text-white cursor-pointer">Terms of Service</span> and <span className="underline hover:text-white cursor-pointer">Privacy Policy</span>
        </p>
      </div>
      <style>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
