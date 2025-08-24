import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Wallet, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface ProfileWalletCardProps {
  user?: User;
}

export default function ProfileWalletCard({ user }: ProfileWalletCardProps) {
  const { toast } = useToast();

  const handleCopyDID = () => {
    if (user?.didAddress) {
      navigator.clipboard.writeText(user.didAddress);
      toast({
        title: "DID Copied",
        description: "DID address copied to clipboard",
      });
    }
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card data-testid="card-profile-wallet">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile & Wallet</h3>
          <Badge 
            variant="outline" 
            className={user?.walletConnected ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}
            data-testid="badge-wallet-status"
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${user?.walletConnected ? "bg-green-600" : "bg-red-600"}`}></span>
            {user?.walletConnected ? "Wallet Connected" : "Wallet Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold" data-testid="text-user-avatar">
                {getInitials(user?.fullName)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground" data-testid="text-user-fullname">
                {user?.fullName || "Loading..."}
              </h2>
              <p className="text-muted-foreground" data-testid="text-user-email">
                {user?.email || "Loading..."}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary" data-testid="text-wallet-balance">
                    ₳{user?.walletBalance || "0.00"}
                  </span>
                  <span className="text-sm text-muted-foreground">ADA</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">DID Address</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-mono text-foreground bg-muted px-3 py-1 rounded" data-testid="text-did-address">
                {user?.didAddress || "Loading..."}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyDID}
                className="text-primary hover:text-primary/80"
                data-testid="button-copy-did-address"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
        
        {/* Show wallet connection warning if disconnected */}
        {!user?.walletConnected && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-400">
                Lace wallet is disconnected. Connect your wallet to access all features.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
