import { Search, Bell, Copy, Moon, Sun, LogOut, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useLocation } from "wouter";
import logoImage from "@assets/horizontal_1756043627119.png";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
  pendingRequestsCount?: number;
}

export default function Header({ user, pendingRequestsCount = 0 }: HeaderProps) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleCopyDID = () => {
    if (user?.didAddress) {
      navigator.clipboard.writeText(user.didAddress);
      toast({
        title: "DID Copied",
        description: "DID address copied to clipboard",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('idshield_session');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    setLocation('/login');
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-card shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="ID Shield" 
            className="h-8 w-auto"
            data-testid="logo-header"
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Input 
              type="search" 
              placeholder="Search vault, proofs, logs..." 
              className="pl-10"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setLocation('/access-requests')}
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingRequestsCount}
              </Badge>
            )}
          </Button>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 h-auto p-2 hover:bg-accent rounded-lg"
                data-testid="button-user-menu"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium" data-testid="text-user-initials">
                    {getInitials(user?.fullName)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                    {user?.fullName || "Loading..."}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-mono text-muted-foreground" data-testid="text-user-did">
                      {user?.didAddress || "Loading..."}
                    </p>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyDID();
                      }}
                      className="h-4 w-4 p-0 cursor-pointer hover:opacity-70 transition-opacity"
                      data-testid="button-copy-did"
                    >
                      <Copy className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" data-testid="dropdown-user-menu">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLocation('/profile')}
                data-testid="menu-item-profile"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                data-testid="menu-item-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
