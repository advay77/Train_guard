import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3,
  BellRing,
  Cog,
  Home,
  Ticket,
  LogOut,
  FileText,
  UserCircle,
  MenuIcon,
  X,
  TrainFront,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const userMenuItems = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Book Ticket", icon: Ticket, path: "/booking" },
    { title: "My Profile", icon: UserCircle, path: "/profile" },
    { title: "Settings", icon: Cog, path: "/settings" },
  ];

  const tteMenuItems = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Security", icon: Shield, path: "/security" },
    { title: "Notifications", icon: BellRing, path: "/notifications" },
    { title: "Security Logs", icon: FileText, path: "/logs" },
    { title: "Settings", icon: Cog, path: "/settings" },
  ];

  const menuItems = user?.role === "tte" ? tteMenuItems : userMenuItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:sticky top-0 bottom-0 left-0 z-40 flex flex-col w-64 h-screen transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col flex-1 bg-sidebar border-r border-sidebar-border">
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <TrainFront className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                {user?.role === "tte" ? "TTE Portal" : "Train Security"}
              </span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col flex-1 py-4 px-3 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                    isActive(item.path)
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive(item.path)
                      ? "text-primary"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )} />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="outline"
              className="w-full justify-start text-sidebar-foreground"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed md:hidden bottom-4 right-4 z-20 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
    </>
  );
}
