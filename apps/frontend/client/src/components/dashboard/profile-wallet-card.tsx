import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
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
      <CardContent className="p-6">
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
                <Badge 
                  variant="outline" 
                  className="text-success border-success"
                  data-testid="badge-wallet-status"
                >
                  <span className="w-2 h-2 bg-success rounded-full mr-1"></span>
                  {user?.walletConnected ? "Lace Wallet Connected" : "Wallet Disconnected"}
                </Badge>
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
      </CardContent>
    </Card>
  );
}
