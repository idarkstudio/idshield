import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Key, X, ExternalLink, Clock, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AuditLog } from "@shared/schema";

interface RecentActivityProps {
  auditLogs: AuditLog[];
}

export default function RecentActivity({ auditLogs }: RecentActivityProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "access_granted":
        return <Check className="text-success" />;
      case "access_request_received":
        return <AlertTriangle className="text-warning" />;
      case "zk_proof_generated":
        return <Key className="text-primary" />;
      case "access_denied":
      case "access_revoked":
        return <X className="text-destructive" />;
      default:
        return <Shield className="text-muted-foreground" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "access_granted":
        return "bg-success";
      case "access_request_received":
        return "bg-warning";
      case "zk_proof_generated":
        return "bg-primary";
      case "access_denied":
      case "access_revoked":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const formatDescription = (log: AuditLog) => {
    const baseDescription = log.description;
    if (log.entityName) {
      return baseDescription.replace(log.entityName, "");
    }
    return baseDescription;
  };

  return (
    <Card data-testid="card-recent-activity">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80"
            data-testid="button-view-full-audit"
            onClick={() => window.location.href = "/audit-log"}
          >
            View Full Audit Log
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg"
                data-testid={`activity-item-${log.id}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(log.action)}`}>
                  {getActivityIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatDescription(log)}
                    {log.entityName && (
                      <span className="font-semibold" data-testid={`entity-name-${log.id}`}>
                        {log.entityName}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`description-${log.id}`}>
                    {log.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center" data-testid={`timestamp-${log.id}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {log.timestamp 
                        ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })
                        : "Unknown time"
                      }
                    </span>
                    {log.privacyLevel && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        data-testid={`privacy-level-${log.id}`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Level {log.privacyLevel} data
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  data-testid={`button-view-audit-details-${log.id}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
