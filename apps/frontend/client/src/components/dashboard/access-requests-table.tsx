import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Eye, RefreshCw, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { AccessRequest } from "@shared/schema";

interface AccessRequestsTableProps {
  accessRequests: AccessRequest[];
}

export default function AccessRequestsTable({ accessRequests }: AccessRequestsTableProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/access-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Access Approved",
        description: "Access request has been approved successfully",
      });
    },
  });

  const denyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/access-requests/${id}/deny`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Access Denied",
        description: "Access request has been denied",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/access-requests/${id}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Access Revoked",
        description: "Access has been revoked successfully",
      });
    },
  });

  const filteredRequests = accessRequests.filter(request => 
    statusFilter === "all" || request.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Approved</Badge>;
      case "denied":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Denied</Badge>;
      case "revoked":
        return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card data-testid="card-access-requests">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Access Requests</CardTitle>
          <div className="flex items-center space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-refresh-requests"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Data Requested</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No access requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow 
                  key={request.id} 
                  className="hover:bg-muted/50"
                  data-testid={`row-request-${request.id}`}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {getInitials(request.requesterName)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground" data-testid={`text-requester-${request.id}`}>
                          {request.requesterName}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.requesterEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-foreground" data-testid={`text-data-requested-${request.id}`}>
                        {request.dataRequested}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Level {request.privacyLevel} data
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground" data-testid={`text-purpose-${request.id}`}>
                      {request.purpose}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span data-testid={`badge-status-${request.id}`}>
                      {getStatusBadge(request.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground" data-testid={`text-date-${request.id}`}>
                      {request.requestDate 
                        ? formatDistanceToNow(new Date(request.requestDate), { addSuffix: true })
                        : "Unknown"
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveMutation.mutate(request.id)}
                            disabled={approveMutation.isPending}
                            className="text-success hover:text-success hover:bg-success/10"
                            data-testid={`button-approve-${request.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => denyMutation.mutate(request.id)}
                            disabled={denyMutation.isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            data-testid={`button-deny-${request.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {request.status === "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeMutation.mutate(request.id)}
                          disabled={revokeMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-testid={`button-revoke-${request.id}`}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        data-testid={`button-view-details-${request.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
