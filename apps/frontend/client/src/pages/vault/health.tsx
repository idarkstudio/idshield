import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DocumentUploader from "@/components/DocumentUploader";
import CreateMedicalFormDialog from "@/components/CreateMedicalFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  Heart, 
  Shield, 
  Plus, 
  FileText, 
  Pill, 
  Activity,
  AlertTriangle,
  Lock,
  Eye,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";
import type { User as UserType, VaultItem } from "@shared/schema";

interface DashboardData {
  user: UserType;
  vaultItems: VaultItem[];
  accessRequests: any[];
}

export default function HealthVault() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMedicalFormOpen, setIsMedicalFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<VaultItem | null>(null);
  
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    refetchInterval: 5000, // Refresh every 5 seconds to show new medical forms
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];
  const user = dashboardData?.user;
  const healthItems = dashboardData?.vaultItems?.filter(item => item.category === "health") || [];

  const getHealthIcon = (type: string) => {
    switch (type) {
      case "medical_records":
        return <FileText className="h-5 w-5" />;
      case "medications":
        return <Pill className="h-5 w-5" />;
      case "vital_signs":
        return <Activity className="h-5 w-5" />;
      case "medical_appointment":
        return <Calendar className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getPrivacyBadgeColor = (level: number) => {
    if (level <= 2) return "bg-green-500"; // Maximum security (0-2)
    if (level <= 4) return "bg-yellow-500"; // Medium security (3-4)
    return "bg-red-500"; // Lower security (5-6)
  };

  const getHealthTypeLabel = (type: string) => {
    switch (type) {
      case "medical_records":
        return "Medical Records";
      case "medications":
        return "Medications";
      case "vital_signs":
        return "Vital Signs";
      case "medical_appointment":
        return "Medical Appointment";
      default:
        return "Health Data";
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
              <h1 className="text-3xl font-bold flex items-center space-x-2" data-testid="title-health-vault">
                <Heart className="h-8 w-8 text-red-500" />
                <span>Health Vault</span>
              </h1>
              <p className="text-muted-foreground">
                Secure storage for your medical records and health data
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Privacy Level {user?.privacyLevel || 0}</span>
              </Badge>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setIsUploadOpen(true)}
                  variant="outline"
                  className="flex items-center space-x-2" 
                  data-testid="button-upload-document"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Document</span>
                </Button>
                <Button 
                  onClick={() => setIsMedicalFormOpen(true)}
                  className="flex items-center space-x-2" 
                  data-testid="button-create-medical-form"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Medical Form</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Health Data Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-total-health-items">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Health Items</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthItems.length}</div>
                <p className="text-xs text-muted-foreground">Secure medical records</p>
              </CardContent>
            </Card>

            <Card data-testid="card-high-security-items">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">High Security Items</CardTitle>
                <Lock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {healthItems.filter(item => item.privacyLevel <= 2).length}
                </div>
                <p className="text-xs text-muted-foreground">Level 0-2 protection</p>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-updates">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {healthItems.filter(item => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(item.createdAt) > weekAgo;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Health Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Your Health Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-16 w-16 mx-auto mb-4 opacity-50 text-red-500" />
                  <h3 className="text-lg font-medium mb-2">No Health Records Yet</h3>
                  <p className="mb-4">Start building your secure health vault</p>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button 
                      onClick={() => setIsUploadOpen(true)}
                      variant="outline"
                      className="flex items-center space-x-2" 
                      data-testid="button-upload-first-document"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Upload Document</span>
                    </Button>
                    <Button 
                      onClick={() => setIsMedicalFormOpen(true)}
                      className="flex items-center space-x-2" 
                      data-testid="button-create-first-medical-form"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Medical Form</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {healthItems.map((item, index) => (
                    <div key={item.id}>
                      <div 
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" 
                        onClick={() => setSelectedAppointment(item)}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.data?.type === "medical_records" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                          item.data?.type === "medications" ? "bg-green-100 dark:bg-green-900/20 text-green-600" :
                          "bg-red-100 dark:bg-red-900/20 text-red-600"
                        }`}>
                          {getHealthIcon(item.data?.type as string)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-foreground" data-testid={`health-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                data-testid={`health-item-type-${item.id}`}
                              >
                                {getHealthTypeLabel(item.data?.type as string)}
                              </Badge>
                              <Badge 
                                className={`text-xs text-white ${getPrivacyBadgeColor(item.privacyLevel)}`}
                                data-testid={`health-item-privacy-${item.id}`}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Level {item.privacyLevel}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Health Data Details */}
                          {item.data && (
                            <div className="text-sm text-muted-foreground mb-2" data-testid={`health-item-details-${item.id}`}>
                              {item.data.type === "medical_records" && item.data.allergies && (
                                <div>Allergies: {Array.isArray(item.data.allergies) ? item.data.allergies.join(", ") : item.data.allergies}</div>
                              )}
                              {item.data.type === "medical_records" && item.data.conditions && (
                                <div>Conditions: {Array.isArray(item.data.conditions) ? item.data.conditions.length : 1} recorded</div>
                              )}
                              {item.data.provider && (
                                <div>Provider: {item.data.provider}</div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center" data-testid={`health-item-date-${item.id}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(item.createdAt!), "MMM dd, yyyy")}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {item.privacyLevel === 0 ? "Absolute Confidential" :
                               item.privacyLevel === 1 ? "Controlled Sensitive" :
                               item.privacyLevel === 2 ? "Private Information" :
                               item.privacyLevel === 3 ? "Internal Information" :
                               item.privacyLevel === 4 ? "Controlled Public" :
                               item.privacyLevel === 5 ? "ZK Proof Access" :
                               "Ecosystem Apps"}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(item);
                          }}
                          data-testid={`button-view-health-details-${item.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      {index < healthItems.length - 1 && <Separator className="my-2" />}
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
              <strong>High Security Zone:</strong> Health records are automatically encrypted at Privacy Level 0 
              (Absolute Confidential) for maximum protection. Medical data can only be accessed by you, 
              with temporary sharing requiring explicit consent and ZK proofs for verification.
            </AlertDescription>
          </Alert>

          {/* Document Uploader */}
          <DocumentUploader 
            category="health"
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
          />

          {/* Medical Form Creator */}
          <CreateMedicalFormDialog
            isOpen={isMedicalFormOpen}
            onClose={() => setIsMedicalFormOpen(false)}
            userId={user?.id || ""}
            patientName={user?.fullName || ""}
          />

          {/* Appointment Details Dialog */}
          <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>{selectedAppointment?.name}</span>
                </DialogTitle>
                <DialogDescription>
                  Complete medical appointment details
                </DialogDescription>
              </DialogHeader>
              
              {selectedAppointment?.data?.type === "medical_appointment" && (
                <div className="space-y-6">
                  {/* Doctor Information */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Doctor Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Doctor Name</p>
                        <p className="text-base">{selectedAppointment.data.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Appointment Type</p>
                        <p className="text-base">{selectedAppointment.data.appointmentType}</p>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Doctor Wallet Address</p>
                        <p className="text-sm font-mono text-muted-foreground break-all">
                          {selectedAppointment.data.doctorWalletAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed On</p>
                        <p className="text-base">
                          {format(new Date(selectedAppointment.data.completedAt), "PPp")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  {selectedAppointment.data.formData && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Medical Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Diagnosis</p>
                          <p className="text-base">{selectedAppointment.data.formData.diagnosis || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Symptoms</p>
                          <p className="text-base">{selectedAppointment.data.formData.symptoms || "Not provided"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Treatment Plan</p>
                          <p className="text-base">{selectedAppointment.data.formData.treatment || "Not provided"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Medications</p>
                          <p className="text-base">{selectedAppointment.data.formData.medications || "None prescribed"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Follow-up Required</p>
                          <Badge variant={selectedAppointment.data.formData.followUpRequired === "yes" ? "destructive" : "secondary"}>
                            {selectedAppointment.data.formData.followUpRequired === "yes" ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vital Signs */}
                  {selectedAppointment.data.formData?.vitalSigns && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Vital Signs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {selectedAppointment.data.formData.vitalSigns.bloodPressure && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
                            <p className="text-base">{selectedAppointment.data.formData.vitalSigns.bloodPressure}</p>
                          </div>
                        )}
                        {selectedAppointment.data.formData.vitalSigns.heartRate && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
                            <p className="text-base">{selectedAppointment.data.formData.vitalSigns.heartRate}</p>
                          </div>
                        )}
                        {selectedAppointment.data.formData.vitalSigns.temperature && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                            <p className="text-base">{selectedAppointment.data.formData.vitalSigns.temperature}</p>
                          </div>
                        )}
                        {selectedAppointment.data.formData.vitalSigns.weight && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Weight</p>
                            <p className="text-base">{selectedAppointment.data.formData.vitalSigns.weight}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {selectedAppointment.data.formData?.notes && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Additional Notes
                      </h3>
                      <p className="text-base">{selectedAppointment.data.formData.notes}</p>
                    </div>
                  )}

                  {/* Privacy Information */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Privacy & Security
                    </h3>
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getPrivacyBadgeColor(selectedAppointment.privacyLevel)} text-white`}>
                        <Shield className="h-3 w-3 mr-1" />
                        Privacy Level {selectedAppointment.privacyLevel}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedAppointment.privacyLevel === 0 ? "Absolute Confidential - Most Sensitive Data" :
                         selectedAppointment.privacyLevel === 1 ? "Controlled Sensitive - Temporary Sharing Only" :
                         selectedAppointment.privacyLevel === 2 ? "Private Information - Trusted Institutions Only" :
                         selectedAppointment.privacyLevel === 3 ? "Internal Information - Organizational Use" :
                         selectedAppointment.privacyLevel === 4 ? "Controlled Public - User Controlled Sharing" :
                         selectedAppointment.privacyLevel === 5 ? "ZK Proof Access - Cryptographic Verification" :
                         "Ecosystem Applications - Third Party APIs"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}