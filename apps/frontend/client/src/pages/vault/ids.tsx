import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DocumentUploader from "@/components/DocumentUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  CreditCard, 
  Shield, 
  Plus, 
  FileText, 
  Car,
  Plane,
  IdCard,
  AlertTriangle,
  Lock,
  Eye,
  Calendar,
  CheckCircle,
  Flag
} from "lucide-react";
import { format } from "date-fns";
import type { User, VaultItem } from "@shared/schema";

interface DashboardData {
  user: User;
  vaultItems: VaultItem[];
  accessRequests: any[];
}

export default function IDsVault() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];
  const user = dashboardData?.user;
  const idItems = dashboardData?.vaultItems?.filter(item => item.category === "ids") || [];

  const getIDIcon = (type: string) => {
    switch (type) {
      case "drivers_license":
        return <Car className="h-5 w-5" />;
      case "passport":
        return <Plane className="h-5 w-5" />;
      case "national_id":
        return <IdCard className="h-5 w-5" />;
      case "voter_id":
        return <Flag className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPrivacyBadgeColor = (level: number) => {
    if (level <= 2) return "bg-red-500";
    if (level <= 4) return "bg-yellow-500"; 
    return "bg-green-500";
  };

  const getIDTypeLabel = (type: string) => {
    switch (type) {
      case "drivers_license":
        return "Driver's License";
      case "passport":
        return "Passport";
      case "national_id":
        return "National ID";
      case "voter_id":
        return "Voter ID";
      default:
        return "Identity Document";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "valid":
      case "active":
        return "text-green-600";
      case "expired":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={undefined} pendingRequestsCount={0} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-48"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <h1 className="text-3xl font-bold flex items-center space-x-2" data-testid="title-ids-vault">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <span>Identity Documents</span>
              </h1>
              <p className="text-muted-foreground">
                Securely store your official identification documents
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Privacy Level {user?.privacyLevel || 0}</span>
              </Badge>
              <Button 
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center space-x-2" 
                data-testid="button-add-id"
              >
                <Plus className="h-4 w-4" />
                <span>Upload ID Document</span>
              </Button>
            </div>
          </div>

          {/* IDs Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-ids">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total IDs</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{idItems.length}</div>
                <p className="text-xs text-muted-foreground">Identity documents</p>
              </CardContent>
            </Card>

            <Card data-testid="card-valid-ids">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Valid IDs</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {idItems.filter(item => item.data?.status !== "expired").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently valid</p>
              </CardContent>
            </Card>

            <Card data-testid="card-high-security-ids">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">High Security</CardTitle>
                <Lock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {idItems.filter(item => item.privacyLevel >= 4).length}
                </div>
                <p className="text-xs text-muted-foreground">Level 4+ protection</p>
              </CardContent>
            </Card>

            <Card data-testid="card-document-types">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Document Types</CardTitle>
                <IdCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(idItems.map(item => item.data?.type)).size}
                </div>
                <p className="text-xs text-muted-foreground">Different types</p>
              </CardContent>
            </Card>
          </div>

          {/* ID Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IdCard className="h-5 w-5" />
                <span>Your Identity Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {idItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50 text-purple-500" />
                  <h3 className="text-lg font-medium mb-2">No ID Documents Yet</h3>
                  <p className="mb-4">Add your identity documents for secure storage</p>
                  <Button 
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center space-x-2" 
                    data-testid="button-add-first-id"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Your First ID Document</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {idItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.data?.type === "drivers_license" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                          item.data?.type === "passport" ? "bg-green-100 dark:bg-green-900/20 text-green-600" :
                          item.data?.type === "national_id" ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600" :
                          "bg-red-100 dark:bg-red-900/20 text-red-600"
                        }`}>
                          {getIDIcon(item.data?.type as string)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-foreground" data-testid={`id-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                data-testid={`id-item-type-${item.id}`}
                              >
                                {getIDTypeLabel(item.data?.type as string)}
                              </Badge>
                              <Badge 
                                className={`text-xs text-white ${getPrivacyBadgeColor(item.privacyLevel)}`}
                                data-testid={`id-item-privacy-${item.id}`}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Level {item.privacyLevel}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* ID Details */}
                          {item.data && (
                            <div className="space-y-1 text-sm text-muted-foreground mb-2" data-testid={`id-item-details-${item.id}`}>
                              {item.data.state && (
                                <div>
                                  <span className="font-medium">State/Region:</span> {item.data.state}
                                </div>
                              )}
                              {item.data.country && (
                                <div>
                                  <span className="font-medium">Country:</span> {item.data.country}
                                </div>
                              )}
                              {item.data.documentNumber && (
                                <div>
                                  <span className="font-medium">Document #:</span> ****{item.data.documentNumber.slice(-4)}
                                </div>
                              )}
                              {item.data.expiryDate && (
                                <div>
                                  <span className="font-medium">Expires:</span> {format(new Date(item.data.expiryDate), "MMM dd, yyyy")}
                                </div>
                              )}
                              {item.data.status && (
                                <div>
                                  <span className="font-medium">Status:</span> 
                                  <span className={`ml-1 ${getStatusColor(item.data.status)}`}>
                                    {item.data.status.charAt(0).toUpperCase() + item.data.status.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center" data-testid={`id-item-date-${item.id}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Added {format(new Date(item.createdAt), "MMM dd, yyyy")}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {item.privacyLevel >= 4 ? "Secure Access" : "Standard Access"}
                            </span>
                            {item.data?.verified && (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          data-testid={`button-view-id-details-${item.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      {index < idItems.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical Security:</strong> Identity documents are highly sensitive and should use 
              maximum privacy levels (Level 4-6). These documents can be used for identity verification 
              via zero-knowledge proofs without exposing the actual document details.
            </AlertDescription>
          </Alert>

          {/* Document Uploader */}
          <DocumentUploader 
            category="ids"
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}