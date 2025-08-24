import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wallet,
  Stethoscope,
  Shield,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from "lucide-react";

interface LaceAPI {
  enable(): Promise<any>;
  getNetworkId(): Promise<number>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  signData(address: string, payload: string): Promise<{ signature: string; key: string }>;
}

interface MedicalFormData {
  diagnosis: string;
  symptoms: string;
  treatment: string;
  medications: string;
  followUpRequired: string;
  notes: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}

export default function MedicalForm() {
  const [match, params] = useRoute("/medical-form/:token");
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState<string>("");
  const [doctorName, setDoctorName] = useState<string>("");
  const [formCompleted, setFormCompleted] = useState(false);
  const [formData, setFormData] = useState<MedicalFormData>({
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    followUpRequired: "no",
    notes: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
    },
  });

  const { data: formToken, isLoading, error } = useQuery({
    queryKey: ["/api/medical-form", params?.token],
    queryFn: () => apiRequest("GET", `/api/medical-form/${params?.token}`),
    enabled: !!params?.token,
  }) as { data: any; isLoading: boolean; error: any };

  const submitFormMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/medical-form/${params?.token}/complete`, data);
    },
    onSuccess: () => {
      setFormCompleted(true);
      toast({
        title: "Form Submitted",
        description: "Medical data has been securely saved to the patient's vault.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit medical form",
        variant: "destructive",
      });
    },
  });

  const connectWallet = async () => {
    try {
      if (!(window as any).cardano?.lace) {
        throw new Error('Lace wallet not found. Please install the Lace extension.');
      }

      const laceApi: LaceAPI = await (window as any).cardano.lace.enable();
      const usedAddresses = await laceApi.getUsedAddresses();
      const unusedAddresses = await laceApi.getUnusedAddresses();
      
      // Try used addresses first, then unused addresses
      const walletAddress = usedAddresses[0] || unusedAddresses[0];
      
      if (!walletAddress) {
        throw new Error('No wallet addresses found. Make sure your Lace wallet has at least one address.');
      }

      setDoctorAddress(walletAddress);
      setWalletConnected(true);
      
      toast({
        title: "Wallet Connected",
        description: "Lace wallet connected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Lace wallet",
        variant: "destructive",
      });
    }
  };

  const handleSubmitForm = async () => {
    if (!walletConnected || !doctorName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please connect your wallet and enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.diagnosis.trim() || !formData.symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required medical fields.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      doctorWalletAddress: doctorAddress,
      doctorName: doctorName.trim(),
      formData,
    };

    submitFormMutation.mutate(submissionData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Loading medical form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold">Form Not Available</h2>
            <p className="text-muted-foreground">
              This medical form may have expired or been already completed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (formCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-xl font-semibold">Form Completed</h2>
            <p className="text-muted-foreground">
              Medical data has been securely saved to {formToken?.patientName}'s health vault.
            </p>
            <p className="text-xs text-muted-foreground">
              The patient will have full control over this data and can generate 
              zero-knowledge proofs for verification when needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">IDShield Medical Form</h1>
          </div>
          <p className="text-muted-foreground">
            Secure medical data entry for {formToken?.patientName}
          </p>
        </div>

        {/* Form Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Appointment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{formToken?.patientName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {formToken?.appointmentType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {formToken?.expiresAt ? new Date(formToken.expiresAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        {!walletConnected ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Wallet className="h-16 w-16 mx-auto text-primary" />
                <h3 className="text-lg font-medium">Connect Your Lace Wallet</h3>
                <p className="text-muted-foreground">
                  You need to authenticate with your Lace wallet to access this medical form.
                </p>
                <Button onClick={connectWallet} data-testid="button-connect-wallet">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Lace Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Wallet connected successfully. You can now complete the medical form.
              </AlertDescription>
            </Alert>

            {/* Doctor Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Doctor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="doctorName">Your Name *</Label>
                  <Input
                    id="doctorName"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    data-testid="input-doctor-name"
                  />
                </div>
                <div>
                  <Label>Wallet Address</Label>
                  <Input
                    value={doctorAddress}
                    readOnly
                    className="font-mono text-xs bg-muted"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Medical Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Enter primary diagnosis"
                      data-testid="input-diagnosis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="followUp">Follow-up Required</Label>
                    <Select 
                      value={formData.followUpRequired} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, followUpRequired: value }))}
                    >
                      <SelectTrigger data-testid="select-follow-up">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="symptoms">Symptoms *</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Describe symptoms presented by the patient"
                    className="min-h-[80px]"
                    data-testid="textarea-symptoms"
                  />
                </div>

                <div>
                  <Label htmlFor="treatment">Treatment Provided</Label>
                  <Textarea
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder="Describe treatment provided"
                    className="min-h-[80px]"
                    data-testid="textarea-treatment"
                  />
                </div>

                <div>
                  <Label htmlFor="medications">Medications Prescribed</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                    placeholder="List medications prescribed with dosage"
                    className="min-h-[60px]"
                    data-testid="textarea-medications"
                  />
                </div>

                {/* Vital Signs */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Vital Signs (Optional)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="bloodPressure">Blood Pressure</Label>
                      <Input
                        id="bloodPressure"
                        value={formData.vitalSigns.bloodPressure}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                        }))}
                        placeholder="120/80"
                        data-testid="input-blood-pressure"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heartRate">Heart Rate</Label>
                      <Input
                        id="heartRate"
                        value={formData.vitalSigns.heartRate}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                        }))}
                        placeholder="72 bpm"
                        data-testid="input-heart-rate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        value={formData.vitalSigns.temperature}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                        }))}
                        placeholder="98.6°F"
                        data-testid="input-temperature"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={formData.vitalSigns.weight}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                        }))}
                        placeholder="150 lbs"
                        data-testid="input-weight"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional observations or notes"
                    className="min-h-[80px]"
                    data-testid="textarea-notes"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmitForm}
                disabled={submitFormMutation.isPending}
                size="lg"
                data-testid="button-submit-form"
              >
                {submitFormMutation.isPending ? "Submitting..." : "Submit Medical Form"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}