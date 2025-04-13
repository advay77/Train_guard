
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "tte";
  photoUrl?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, role: "user" | "tte") => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user is already logged in
    const savedUser = localStorage.getItem("trainSecurityUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("trainSecurityUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: "user" | "tte"): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in a real app, this would be a fetch to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock login logic - in a real app, this would validate credentials against your backend
        if (email && password) {
          // Mock user data
          const mockUsers = {
            user: {
              id: "user-123",
              name: "John Traveler",
              email: email,
              role: "user" as const,
              photoUrl: "/placeholder.svg"
            },
            tte: {
              id: "tte-456",
              name: "Inspector Kumar",
              email: email,
              role: "tte" as const,
              photoUrl: "/placeholder.svg"
            }
          };
          
          const loggedInUser = mockUsers[role];
          setUser(loggedInUser);
          setIsAuthenticated(true);
          localStorage.setItem("trainSecurityUser", JSON.stringify(loggedInUser));
          
          toast.success(`Welcome back, ${loggedInUser.name}!`);
          setIsLoading(false);
          resolve(true);
        } else {
          toast.error("Invalid email or password");
          setIsLoading(false);
          resolve(false);
        }
      }, 1000); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("trainSecurityUser");
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
