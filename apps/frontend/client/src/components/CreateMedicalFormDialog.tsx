import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar,
  Copy,
  Link2,
  CheckCircle,
  Clock,
  Stethoscope,
  Share
} from "lucide-react";

interface CreateMedicalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  patientName: string;
}

interface FormData {
  patientName: string;
  appointmentType: string;
  expiresIn: number; // hours
}

export default function CreateMedicalFormDialog({ 
  isOpen, 
  onClose, 
  userId, 
  patientName 
}: CreateMedicalFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    patientName,
    appointmentType: "",
    expiresIn: 24,
  });
  const [createdToken, setCreatedToken] = useState<string>("");
  const [shareableLink, setShareableLink] = useState<string>("");

  const createFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/medical-form-tokens", data);
      return response.json();
    },
    onSuccess: (response: any) => {
      console.log("Form creation response:", response);
      if (response.token) {
        const token = response.token;
        const link = `${window.location.origin}/medical-form/${token}`;
        setCreatedToken(token);
        setShareableLink(link);
        
        toast({
          title: "Medical Form Created",
          description: "Your shareable medical form link is ready!",
        });
      } else {
        console.error("No token in response:", response);
        toast({
          title: "Creation Failed",
          description: "Server didn't return a valid token",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create medical form",
        variant: "destructive",
      });
    },
  });

  const handleCreateForm = async () => {
    if (!formData.appointmentType) {
      toast({
        title: "Missing Information",
        description: "Please select an appointment type.",
        variant: "destructive",
      });
      return;
    }

    const tokenData = {
      token: crypto.randomUUID().replace(/-/g, ''),
      userId,
      patientName: formData.patientName,
      appointmentType: formData.appointmentType,
      expiresAt: new Date(Date.now() + formData.expiresIn * 60 * 60 * 1000).toISOString(),
    };

    createFormMutation.mutate(tokenData);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Copied!",
        description: "Medical form link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      patientName,
      appointmentType: "",
      expiresIn: 24,
    });
    setCreatedToken("");
    setShareableLink("");
    onClose();
  };

  const appointmentTypes = [
    { value: "general_consultation", label: "General Consultation" },
    { value: "specialist_visit", label: "Specialist Visit" },
    { value: "annual_checkup", label: "Annual Checkup" },
    { value: "follow_up", label: "Follow-up Appointment" },
    { value: "diagnostic_test", label: "Diagnostic Test" },
    { value: "vaccination", label: "Vaccination" },
    { value: "mental_health", label: "Mental Health Consultation" },
    { value: "emergency_visit", label: "Emergency Visit" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Create Medical Form</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!createdToken ? (
            <>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Create a secure form that doctors can access with their Lace wallet to record your 
                    medical appointment data directly into your health vault.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Patient name"
                    data-testid="input-patient-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select 
                    value={formData.appointmentType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
                  >
                    <SelectTrigger data-testid="select-appointment-type">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Link Expiration</Label>
                  <Select 
                    value={formData.expiresIn.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expiresIn: parseInt(value) }))}
                  >
                    <SelectTrigger data-testid="select-expiration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours (Recommended)</SelectItem>
                      <SelectItem value="72">3 days</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateForm} 
                  disabled={createFormMutation.isPending}
                  data-testid="button-create-form"
                >
                  {createFormMutation.isPending ? "Creating..." : "Create Form"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">Medical Form Created!</h3>
                <p className="text-muted-foreground">
                  Share this link with your doctor
                </p>
              </div>

              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Appointment</span>
                      </div>
                      <span className="text-sm font-medium">
                        {appointmentTypes.find(t => t.value === formData.appointmentType)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Expires in</span>
                      </div>
                      <span className="text-sm font-medium">{formData.expiresIn} hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="font-mono text-xs"
                    data-testid="shareable-link"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={copyToClipboard}
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center">
                  <Share className="h-4 w-4 mr-2" />
                  The doctor will need their Lace wallet to authenticate and complete the form.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleClose} data-testid="button-done">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}