import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  Check, 
  AlertTriangle, 
  Key, 
  X, 
  Clock, 
  Shield,
  Search,
  Filter,
  Download,
  Calendar
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import type { User, AuditLog } from "@shared/schema";

interface DashboardData {
  user: User;
  auditLogs: AuditLog[];
  accessRequests: any[];
}

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterPrivacyLevel, setFilterPrivacyLevel] = useState("all");

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "access_granted":
        return <Check className="h-5 w-5 text-green-600" />;
      case "access_request_received":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "zk_proof_generated":
        return <Key className="h-5 w-5 text-blue-600" />;
      case "access_denied":
      case "access_revoked":
        return <X className="h-5 w-5 text-red-600" />;
      case "profile_updated":
        return <Shield className="h-5 w-5 text-purple-600" />;
      case "privacy_level_updated":
        return <Shield className="h-5 w-5 text-indigo-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "access_granted":
        return "bg-green-100 dark:bg-green-900/20";
      case "access_request_received":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      case "zk_proof_generated":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "access_denied":
      case "access_revoked":
        return "bg-red-100 dark:bg-red-900/20";
      case "profile_updated":
        return "bg-purple-100 dark:bg-purple-900/20";
      case "privacy_level_updated":
        return "bg-indigo-100 dark:bg-indigo-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "access_granted":
        return "bg-green-500";
      case "access_request_received":
        return "bg-yellow-500";
      case "zk_proof_generated":
        return "bg-blue-500";
      case "access_denied":
      case "access_revoked":
        return "bg-red-500";
      case "profile_updated":
        return "bg-purple-500";
      case "privacy_level_updated":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredLogs = dashboardData?.auditLogs?.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.entityName && log.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesPrivacyLevel = filterPrivacyLevel === "all" || 
                                log.privacyLevel?.toString() === filterPrivacyLevel;
    
    return matchesSearch && matchesAction && matchesPrivacyLevel;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={undefined} pendingRequestsCount={0} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={dashboardData?.user} pendingRequestsCount={pendingRequests.length} />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="title-audit-log">Complete Audit Log</h1>
              <p className="text-muted-foreground">
                Comprehensive log of all activity and data interactions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Privacy Level {dashboardData?.user?.privacyLevel || 0}</span>
              </Badge>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                data-testid="button-export-audit-log"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-logs"
                  />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger data-testid="select-filter-action">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="access_granted">Access Granted</SelectItem>
                    <SelectItem value="access_denied">Access Denied</SelectItem>
                    <SelectItem value="access_revoked">Access Revoked</SelectItem>
                    <SelectItem value="access_request_received">Request Received</SelectItem>
                    <SelectItem value="zk_proof_generated">ZK Proof Generated</SelectItem>
                    <SelectItem value="profile_updated">Profile Updated</SelectItem>
                    <SelectItem value="privacy_level_updated">Privacy Level Updated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPrivacyLevel} onValueChange={setFilterPrivacyLevel}>
                  <SelectTrigger data-testid="select-filter-privacy">
                    <SelectValue placeholder="All Privacy Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="0">Level 0</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                    <SelectItem value="6">Level 6</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span data-testid="text-results-count">
                    {filteredLogs.length} of {dashboardData?.auditLogs?.length || 0} entries
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Activity Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No audit entries found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log, index) => (
                    <div key={log.id}>
                      <div 
                        className={`p-6 rounded-lg border ${getActivityColor(log.action)}`}
                        data-testid={`audit-entry-${log.id}`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getActionBadgeColor(log.action)}`}>
                            {getActivityIcon(log.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs font-medium"
                                data-testid={`action-badge-${log.id}`}
                              >
                                {formatActionName(log.action)}
                              </Badge>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center" data-testid={`timestamp-${log.id}`}>
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {log.timestamp 
                                    ? format(new Date(log.timestamp), "MMM dd, yyyy 'at' HH:mm")
                                    : "Unknown time"
                                  }
                                </span>
                                <span className="flex items-center" data-testid={`relative-time-${log.id}`}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {log.timestamp 
                                    ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })
                                    : "Unknown"
                                  }
                                </span>
                              </div>
                            </div>
                            <h3 className="font-medium text-foreground mb-1" data-testid={`description-${log.id}`}>
                              {log.description}
                            </h3>
                            {log.entityName && (
                              <p className="text-sm text-muted-foreground mb-2" data-testid={`entity-${log.id}`}>
                                Entity: <span className="font-medium">{log.entityName}</span>
                              </p>
                            )}
                            <div className="flex items-center space-x-4">
                              {log.privacyLevel && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  data-testid={`privacy-badge-${log.id}`}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Privacy Level {log.privacyLevel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}