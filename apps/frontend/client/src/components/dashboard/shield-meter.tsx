import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, VaultItem } from "@shared/schema";

interface ShieldMeterProps {
  user?: User;
  vaultItems?: VaultItem[];
}

const privacyLevels = [
  { level: 0, name: "Absolute Confidential", color: "bg-green-100 text-green-600" },
  { level: 1, name: "Controlled Sensitive", color: "bg-green-100 text-green-600" },
  { level: 2, name: "Private Information", color: "bg-green-100 text-green-600" },
  { level: 3, name: "Internal Information", color: "bg-yellow-100 text-yellow-600" },
  { level: 4, name: "Controlled Public", color: "bg-orange-100 text-orange-600" },
  { level: 5, name: "ZK Proof Access", color: "bg-red-100 text-red-600" },
  { level: 6, name: "Ecosystem Apps", color: "bg-red-100 text-red-600" },
];

export default function ShieldMeter({ user, vaultItems = [] }: ShieldMeterProps) {
  const currentLevel = user?.privacyLevel || 0;
  const progressPercentage = (currentLevel / 6) * 100;
  
  const getLevelInfo = (level: number) => {
    return privacyLevels.find(p => p.level === level) || privacyLevels[0];
  };

  const currentLevelInfo = getLevelInfo(currentLevel);

  // Group vault items by category
  const vaultCategories = [
    { name: "Identity Verification", items: vaultItems.filter(item => item.category === "ids"), level: 4 },
    { name: "Health Records", items: vaultItems.filter(item => item.category === "health"), level: 6 },
    { name: "Insurance Data", items: vaultItems.filter(item => item.category === "insurance"), level: 5 },
  ];

  return (
    <Card data-testid="card-shield-meter">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>Privacy Shield Level</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Progress */}
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="hsl(var(--muted))" 
                strokeWidth="8" 
                fill="none"
              />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="hsl(var(--primary))" 
                strokeWidth="8" 
                fill="none"
                strokeDasharray="351.86"
                strokeDashoffset={351.86 - (351.86 * progressPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-primary" data-testid="text-privacy-level">
                  {currentLevel}
                </span>
                <p className="text-sm text-muted-foreground">of 6</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge 
              className={cn("text-sm px-3 py-1", currentLevelInfo.color)}
              data-testid="badge-privacy-status"
            >
              {currentLevelInfo.name}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {currentLevel <= 2 ? "Maximum security protection active" : "Consider upgrading to higher security levels"}
            </p>
          </div>
        </div>

        {/* Privacy Categories */}
        <div className="space-y-3">
          {vaultCategories.map((category) => (
            <div 
              key={category.name} 
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                category.items.length > 0 ? "bg-muted" : "border-2 border-dashed border-muted"
              )}
              data-testid={`privacy-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  category.items.length > 0 ? "bg-success" : "bg-muted-foreground"
                )}>
                  {category.items.length > 0 ? (
                    <Check className="text-success-foreground text-xs" />
                  ) : (
                    <Plus className="text-muted-foreground text-xs" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  category.items.length > 0 ? "text-foreground" : "text-muted-foreground"
                )}>
                  {category.name}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className="text-xs"
                data-testid={`badge-category-level-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category.items.length > 0 ? `Level ${category.level}` : "Not Set"}
              </Badge>
            </div>
          ))}
        </div>

        <Button 
          className="w-full"
          data-testid="button-manage-permissions"
        >
          Manage Permissions
        </Button>
      </CardContent>
    </Card>
  );
}
