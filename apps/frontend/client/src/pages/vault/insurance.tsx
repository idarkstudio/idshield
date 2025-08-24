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
  Shield, 
  Plus, 
  FileText, 
  Car,
  Home,
  Heart,
  AlertTriangle,
  Lock,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import type { User, VaultItem } from "@shared/schema";

interface DashboardData {
  user: User;
  vaultItems: VaultItem[];
  accessRequests: any[];
}

export default function InsuranceVault() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];
  const user = dashboardData?.user;
  const insuranceItems = dashboardData?.vaultItems?.filter(item => item.category === "insurance") || [];

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case "health_insurance":
        return <Heart className="h-5 w-5" />;
      case "auto_insurance": 
        return <Car className="h-5 w-5" />;
      case "home_insurance":
        return <Home className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getPrivacyBadgeColor = (level: number) => {
    if (level <= 2) return "bg-red-500";
    if (level <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getInsuranceTypeLabel = (type: string) => {
    switch (type) {
      case "health_insurance":
        return "Health Insurance";
      case "auto_insurance":
        return "Auto Insurance";
      case "home_insurance":
        return "Home Insurance";
      default:
        return "Insurance Policy";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
              <h1 className="text-3xl font-bold flex items-center space-x-2" data-testid="title-insurance-vault">
                <Shield className="h-8 w-8 text-blue-500" />
                <span>Insurance Vault</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your insurance policies and coverage information
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
                data-testid="button-add-insurance"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Policy Document</span>
              </Button>
            </div>
          </div>

          {/* Insurance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-policies">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insuranceItems.length}</div>
                <p className="text-xs text-muted-foreground">Active coverage</p>
              </CardContent>
            </Card>

            <Card data-testid="card-active-policies">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {insuranceItems.filter(item => item.data?.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently covered</p>
              </CardContent>
            </Card>

            <Card data-testid="card-high-security">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">High Security</CardTitle>
                <Lock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {insuranceItems.filter(item => item.privacyLevel >= 5).length}
                </div>
                <p className="text-xs text-muted-foreground">Level 5-6 protection</p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-coverage">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Coverage Types</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(insuranceItems.map(item => item.data?.type)).size}
                </div>
                <p className="text-xs text-muted-foreground">Different types</p>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Policies List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Your Insurance Policies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insuranceItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50 text-blue-500" />
                  <h3 className="text-lg font-medium mb-2">No Insurance Policies Yet</h3>
                  <p className="mb-4">Add your insurance policies to keep them secure</p>
                  <Button 
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center space-x-2" 
                    data-testid="button-add-first-insurance"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Your First Policy</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {insuranceItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.data?.type === "health_insurance" ? "bg-red-100 dark:bg-red-900/20 text-red-600" :
                          item.data?.type === "auto_insurance" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                          item.data?.type === "home_insurance" ? "bg-green-100 dark:bg-green-900/20 text-green-600" :
                          "bg-purple-100 dark:bg-purple-900/20 text-purple-600"
                        }`}>
                          {getInsuranceIcon(item.data?.type as string)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-foreground" data-testid={`insurance-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                data-testid={`insurance-item-type-${item.id}`}
                              >
                                {getInsuranceTypeLabel(item.data?.type as string)}
                              </Badge>
                              <Badge 
                                className={`text-xs text-white ${getPrivacyBadgeColor(item.privacyLevel)}`}
                                data-testid={`insurance-item-privacy-${item.id}`}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Level {item.privacyLevel}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Insurance Details */}
                          {item.data && (
                            <div className="space-y-1 text-sm text-muted-foreground mb-2" data-testid={`insurance-item-details-${item.id}`}>
                              {item.data?.provider && (
                                <div>
                                  <span className="font-medium">Provider:</span> {item.data.provider}
                                </div>
                              )}
                              {item.data?.policyNumber && (
                                <div>
                                  <span className="font-medium">Policy:</span> {item.data.policyNumber}
                                </div>
                              )}
                              {item.data?.coverage && (
                                <div>
                                  <span className="font-medium">Coverage:</span> ${item.data.coverage.toLocaleString()}
                                </div>
                              )}
                              {item.data?.status && (
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
                            <span className="flex items-center" data-testid={`insurance-item-date-${item.id}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Added {format(new Date(item.createdAt!), "MMM dd, yyyy")}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {item.privacyLevel >= 5 ? "ZK Proof Required" : "Standard Access"}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          data-testid={`button-view-insurance-details-${item.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      {index < insuranceItems.length - 1 && <Separator className="my-2" />}
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
              <strong>Insurance Protection:</strong> Insurance policies contain sensitive financial information.
              Higher privacy levels (Level 4+) are recommended to protect against identity theft and fraud.
              Police verification requires Level 5+ with zero-knowledge proofs.
            </AlertDescription>
          </Alert>

          {/* Document Uploader */}
          <DocumentUploader 
            category="insurance"
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}