import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, UserPlus, UserX, Download, ExternalLink, ChevronRight, QrCode } from "lucide-react";
import GrantAccessModal from "@/components/modals/grant-access-modal";
import GenerateProofModal from "@/components/modals/generate-proof-modal";

export default function QuickActions() {
  const [grantAccessOpen, setGrantAccessOpen] = useState(false);
  const [generateProofOpen, setGenerateProofOpen] = useState(false);

  const actions = [
    {
      id: "generate-proof",
      title: "Generate ZK Proof",
      description: "Create verifiable proof without revealing data",
      icon: Tag,
      color: "bg-primary hover:bg-primary/90",
      onClick: () => setGenerateProofOpen(true),
    },
    {
      id: "generate-qr-proof",
      title: "Generate QR Proof",
      description: "Create ZK proof with QR code for easy sharing",
      icon: QrCode,
      color: "bg-purple-600 hover:bg-purple-600/90",
      onClick: () => setGenerateProofOpen(true),
    },
    {
      id: "grant-access",
      title: "Grant Access",
      description: "Share specific data with trusted parties",
      icon: UserPlus,
      color: "bg-success hover:bg-success/90",
      onClick: () => setGrantAccessOpen(true),
    },
    {
      id: "revoke-access",
      title: "Revoke Access",
      description: "Remove permissions from entities",
      icon: UserX,
      color: "bg-destructive hover:bg-destructive/90",
      onClick: () => {},
    },
  ];

  const utilities = [
    { id: "backup", title: "Backup", icon: Download },
    { id: "export", title: "Export", icon: ExternalLink },
  ];

  return (
    <>
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Actions */}
          <div className="space-y-4">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full h-auto p-4 justify-between group hover:border-primary/50"
                onClick={action.onClick}
                data-testid={`button-${action.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            ))}
          </div>

          {/* Utility Actions */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              {utilities.map((utility) => (
                <Button
                  key={utility.id}
                  variant="outline"
                  className="h-12 flex-col space-y-1"
                  data-testid={`button-${utility.id}`}
                >
                  <utility.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{utility.title}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <GrantAccessModal open={grantAccessOpen} onOpenChange={setGrantAccessOpen} />
      <GenerateProofModal open={generateProofOpen} onOpenChange={setGenerateProofOpen} />
    </>
  );
}
