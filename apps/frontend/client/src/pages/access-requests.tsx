import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Mail,
  FileText,
  Calendar,
  Shield
} from "lucide-react";
import type { User, AccessRequest } from "@shared/schema";

interface DashboardData {
  user: User;
  accessRequests: AccessRequest[];
}

export default function AccessRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest("POST", `/api/access-requests/${requestId}/approve`);
    },
    onMutate: (requestId) => {
      setProcessingRequestId(requestId);
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "Access request has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setProcessingRequestId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve access request",
        variant: "destructive",
      });
      setProcessingRequestId(null);
    },
  });

  const denyRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest("POST", `/api/access-requests/${requestId}/deny`);
    },
    onMutate: (requestId) => {
      setProcessingRequestId(requestId);
    },
    onSuccess: () => {
      toast({
        title: "Request Denied",
        description: "Access request has been denied.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setProcessingRequestId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Denial Failed",
        description: error.message || "Failed to deny access request",
        variant: "destructive",
      });
      setProcessingRequestId(null);
    },
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="flex items-center space-x-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Denied</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Unknown</span>
          </Badge>
        );
    }
  };

  const getPrivacyLevelColor = (level: number) => {
    if (level <= 2) return "text-green-600";
    if (level <= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const user = dashboardData?.user;
  const accessRequests = dashboardData?.accessRequests || [];
  const pendingRequests = accessRequests.filter(req => req.status === "pending");
  const processedRequests = accessRequests.filter(req => req.status !== "pending");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} pendingRequestsCount={pendingRequests.length} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} pendingRequestsCount={pendingRequests.length} />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="title-access-requests">Access Requests</h1>
              <p className="text-muted-foreground">
                Manage who can access your personal data and for what purpose
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Privacy Level {user?.privacyLevel || 0}</span>
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-total-requests">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accessRequests.length}</div>
                <p className="text-xs text-muted-foreground">All time requests</p>
              </CardContent>
            </Card>

            <Card data-testid="card-pending-requests">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </CardContent>
            </Card>

            <Card data-testid="card-processed-requests">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{processedRequests.length}</div>
                <p className="text-xs text-muted-foreground">Approved or denied</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card data-testid="card-pending-section">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span>Pending Requests</span>
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="border rounded-lg p-4 space-y-4"
                    data-testid={`request-pending-${request.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold" data-testid={`text-requester-${request.id}`}>
                              {request.requesterName}
                            </span>
                          </div>
                          {getStatusBadge(request.status)}
                          <Badge 
                            variant="outline" 
                            className={`flex items-center space-x-1 ${getPrivacyLevelColor(request.privacyLevel)}`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>Level {request.privacyLevel}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{request.requesterEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(request.requestDate)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Data Requested:</strong> {request.dataRequested}
                          </p>
                          <p className="text-sm">
                            <strong>Purpose:</strong> {request.purpose}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="destructive"
                        onClick={() => denyRequestMutation.mutate(request.id)}
                        disabled={processingRequestId === request.id}
                        data-testid={`button-deny-${request.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {processingRequestId === request.id ? "Processing..." : "Deny"}
                      </Button>
                      <Button
                        onClick={() => approveRequestMutation.mutate(request.id)}
                        disabled={processingRequestId === request.id}
                        data-testid={`button-approve-${request.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingRequestId === request.id ? "Processing..." : "Approve"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Request History */}
          <Card data-testid="card-request-history">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Request History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accessRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Access Requests</h3>
                  <p className="text-muted-foreground">
                    You don't have any access requests yet. When organizations request access to your data, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="border rounded-lg p-4"
                      data-testid={`request-history-${request.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{request.requesterName}</span>
                          </div>
                          {getStatusBadge(request.status)}
                          <Badge 
                            variant="outline" 
                            className={`flex items-center space-x-1 ${getPrivacyLevelColor(request.privacyLevel)}`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>Level {request.privacyLevel}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{request.requesterEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Requested: {formatDate(request.requestDate)}</span>
                        </div>
                        {request.responseDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Responded: {formatDate(request.responseDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm space-y-1">
                        <p><strong>Data Requested:</strong> {request.dataRequested}</p>
                        <p><strong>Purpose:</strong> {request.purpose}</p>
                      </div>
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