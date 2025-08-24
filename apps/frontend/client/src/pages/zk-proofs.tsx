import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  Key, 
  Shield, 
  Plus, 
  Share,
  QrCode,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  Eye,
  Calendar,
  Users,
  FileText,
  Heart,
  Car,
  Building
} from "lucide-react";
import { format } from "date-fns";
import type { User, ZKProof } from "@shared/schema";

interface DashboardData {
  user: User;
  zkProofs: ZKProof[];
  accessRequests: any[];
  vaultItems: any[];
}

const zkProofSchema = z.object({
  proofType: z.enum(["age_verification", "income_verification", "identity_verification", "medical_verification", "insurance_verification", "police_verification"]),
  attributes: z.object({
    minAge: z.number().optional(),
    minIncome: z.number().optional(), 
    citizenship: z.string().optional(),
    // Medical verification specific fields
    medicalConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    bloodType: z.string().optional(),
    medications: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    // Other fields
    insuranceType: z.string().optional(),
    insuranceStatus: z.string().optional(),
    badgeNumber: z.string().optional(),
    expiresInDays: z.number().optional(),
  }).optional(),
  recipientName: z.string().min(2, "Recipient name required"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
});

type ZKProofFormData = z.infer<typeof zkProofSchema>;

// Helper function to generate proof results
function generateProofResult(proofType: string, attributes: any): string {
  switch (proofType) {
    case "age_verification":
      return `User is over ${attributes.minAge || 18} years old`;
    case "income_verification":
      return `User's income is above $${attributes.minIncome?.toLocaleString() || '50,000'} annually`;
    case "identity_verification":
      return `User is a verified citizen of ${attributes.citizenship || 'the United States'}`;
    case "medical_verification":
      const medicalInfo = [];
      if (attributes.medicalConditions?.length > 0) {
        medicalInfo.push(`Medical conditions: ${attributes.medicalConditions.join(', ')}`);
      }
      if (attributes.chronicConditions?.length > 0) {
        medicalInfo.push(`Chronic conditions: ${attributes.chronicConditions.join(', ')}`);
      }
      if (attributes.allergies?.length > 0) {
        medicalInfo.push(`Allergies: ${attributes.allergies.join(', ')}`);
      }
      if (attributes.bloodType) {
        medicalInfo.push(`Blood type: ${attributes.bloodType}`);
      }
      if (attributes.medications?.length > 0) {
        medicalInfo.push(`Medications: ${attributes.medications.join(', ')}`);
      }
      return medicalInfo.length > 0 
        ? `Medical verification confirmed: ${medicalInfo.join(' | ')}`
        : 'General medical status verified';
    case "insurance_verification":
      return `User has ${attributes.insuranceStatus || 'active'} ${attributes.insuranceType || 'health'} insurance coverage`;
    case "police_verification":
      return `Verified law enforcement officer with badge #${attributes.badgeNumber || 'CLASSIFIED'}`;
    default:
      return "Identity claim has been cryptographically verified";
  }
}

export default function ZKProofs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProofType, setSelectedProofType] = useState<string>("");
  const [createdProof, setCreatedProof] = useState<any>(null);
  const [selectedExpiration, setSelectedExpiration] = useState<number>(30);

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];
  const user = dashboardData?.user;
  const zkProofs = dashboardData?.zkProofs || [];

  const form = useForm<ZKProofFormData>({
    resolver: zodResolver(zkProofSchema),
    defaultValues: {
      recipientName: "",
      purpose: "",
      attributes: {},
    },
  });

  const createProofMutation = useMutation({
    mutationFn: async (data: ZKProofFormData) => {
      // Generate proof result based on proof type and attributes
      const proofResult = generateProofResult(data.proofType, data.attributes || {});
      
      const response = await apiRequest("POST", "/api/generate-proof", {
        ...data,
        proofResult,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedProof(data);
      toast({
        title: "ZK Proof Created",
        description: "Your zero-knowledge proof has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed", 
        description: error.message || "Failed to create ZK proof",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ZKProofFormData) => {
    createProofMutation.mutate(data);
  };

  const getProofIcon = (type: string) => {
    switch (type) {
      case "age_verification":
        return <Users className="h-5 w-5" />;
      case "income_verification":
        return <Building className="h-5 w-5" />;
      case "identity_verification":
        return <Key className="h-5 w-5" />;
      case "medical_verification":
        return <Heart className="h-5 w-5" />;
      case "insurance_verification":
        return <Shield className="h-5 w-5" />;
      case "police_verification":
        return <Car className="h-5 w-5" />;
      default:
        return <Lock className="h-5 w-5" />;
    }
  };

  const getProofTypeLabel = (type: string) => {
    switch (type) {
      case "age_verification":
        return "Age Verification";
      case "income_verification":
        return "Income Verification";
      case "identity_verification":
        return "Identity Verification";
      case "medical_verification":
        return "Medical Verification";
      case "insurance_verification":
        return "Insurance Verification";
      case "police_verification":
        return "Police Verification";
      default:
        return "Unknown Proof";
    }
  };

  const getProofPrivacyLevel = (type: string) => {
    switch (type) {
      case "medical_verification":
        return 6;
      case "police_verification":
      case "insurance_verification":
        return 5;
      case "income_verification":
        return 4;
      case "identity_verification":
        return 3;
      case "age_verification":
        return 2;
      default:
        return 3;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Proof details copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
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
              <h1 className="text-3xl font-bold flex items-center space-x-2" data-testid="title-zk-proofs">
                <Key className="h-8 w-8 text-purple-500" />
                <span>Zero-Knowledge Proofs</span>
              </h1>
              <p className="text-muted-foreground">
                Create and manage cryptographic proofs without revealing sensitive data
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Privacy Level {user?.privacyLevel || 0}</span>
              </Badge>
              <Button 
                onClick={() => setIsCreating(true)}
                className="flex items-center space-x-2" 
                data-testid="button-create-zk-proof"
              >
                <Plus className="h-4 w-4" />
                <span>Create ZK Proof</span>
              </Button>
            </div>
          </div>

          {/* ZK Proofs Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-proofs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Proofs</CardTitle>
                <Key className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{zkProofs.length}</div>
                <p className="text-xs text-muted-foreground">Generated proofs</p>
              </CardContent>
            </Card>

            <Card data-testid="card-medical-proofs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Medical Proofs</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {zkProofs.filter(proof => proof.proofType === "medical_verification").length}
                </div>
                <p className="text-xs text-muted-foreground">Level 6 security</p>
              </CardContent>
            </Card>

            <Card data-testid="card-police-proofs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Police Proofs</CardTitle>
                <Car className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {zkProofs.filter(proof => proof.proofType === "police_verification").length}
                </div>
                <p className="text-xs text-muted-foreground">Level 5 security</p>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-proofs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {zkProofs.filter(proof => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(proof.createdAt) > weekAgo;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Recent activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Show Created Proof with Shareable Link */}
          {createdProof && (
            <Card data-testid="card-created-proof">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>ZK Proof Created Successfully!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Shareable Link</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${window.location.origin}/verify-proof/${createdProof.id}`}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-shareable-link"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${window.location.origin}/verify-proof/${createdProof.id}`)}
                      data-testid="button-copy-link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this link to allow verification of your proof without revealing the underlying data.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCreatedProof(null)}
                    variant="outline"
                    data-testid="button-close-created-proof"
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => setIsCreating(true)}
                    variant="ghost"
                    data-testid="button-create-another-proof"
                  >
                    Create Another Proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create ZK Proof Form */}
          {isCreating && !createdProof && (
            <Card data-testid="card-create-zk-proof">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New ZK Proof</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="proofType">Proof Type</Label>
                      <Select 
                        value={form.watch("proofType")} 
                        onValueChange={(value: any) => {
                          form.setValue("proofType", value);
                          setSelectedProofType(value);
                        }}
                      >
                        <SelectTrigger data-testid="select-proof-type">
                          <SelectValue placeholder="Select proof type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="age_verification">Age Verification (Level 2)</SelectItem>
                          <SelectItem value="income_verification">Income Verification (Level 4)</SelectItem>
                          <SelectItem value="identity_verification">Identity Verification (Level 3)</SelectItem>
                          <SelectItem value="medical_verification">Medical Verification (Level 6)</SelectItem>
                          <SelectItem value="insurance_verification">Insurance Verification (Level 5)</SelectItem>
                          <SelectItem value="police_verification">Police Verification (Level 5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        {...form.register("recipientName")}
                        placeholder="Who will receive this proof?"
                        data-testid="input-recipient-name"
                      />
                      {form.formState.errors.recipientName && (
                        <p className="text-sm text-destructive">{form.formState.errors.recipientName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Attributes Based on Proof Type */}
                  {selectedProofType && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Proof Parameters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProofType === "age_verification" && (
                          <div className="space-y-2">
                            <Label>Minimum Age</Label>
                            <Input
                              type="number"
                              placeholder="18"
                              onChange={(e) => form.setValue("attributes.minAge", parseInt(e.target.value))}
                              data-testid="input-min-age"
                            />
                          </div>
                        )}
                        {selectedProofType === "income_verification" && (
                          <div className="space-y-2">
                            <Label>Minimum Annual Income ($)</Label>
                            <Input
                              type="number"
                              placeholder="50000"
                              onChange={(e) => form.setValue("attributes.minIncome", parseInt(e.target.value))}
                              data-testid="input-min-income"
                            />
                          </div>
                        )}
                        {selectedProofType === "identity_verification" && (
                          <div className="space-y-2">
                            <Label>Citizenship</Label>
                            <Input
                              placeholder="US, CA, UK, etc."
                              onChange={(e) => form.setValue("attributes.citizenship", e.target.value)}
                              data-testid="input-citizenship"
                            />
                          </div>
                        )}
                        {selectedProofType === "medical_verification" && (
                          <div className="col-span-2 space-y-4">
                            <h5 className="font-medium text-sm text-muted-foreground">Medical Information to Verify</h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Medical Conditions */}
                              <div className="space-y-2">
                                <Label>Medical Conditions</Label>
                                <Input
                                  placeholder="e.g., diabetes, hypertension (comma-separated)"
                                  onChange={(e) => {
                                    const conditions = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                                    form.setValue("attributes.medicalConditions", conditions);
                                  }}
                                  data-testid="input-medical-conditions"
                                />
                                <p className="text-xs text-muted-foreground">Separate multiple conditions with commas</p>
                              </div>

                              {/* Chronic Conditions */}
                              <div className="space-y-2">
                                <Label>Chronic Conditions</Label>
                                <Input
                                  placeholder="e.g., asthma, arthritis (comma-separated)"
                                  onChange={(e) => {
                                    const conditions = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                                    form.setValue("attributes.chronicConditions", conditions);
                                  }}
                                  data-testid="input-chronic-conditions"
                                />
                              </div>

                              {/* Allergies */}
                              <div className="space-y-2">
                                <Label>Allergies</Label>
                                <Input
                                  placeholder="e.g., penicillin, nuts, pollen (comma-separated)"
                                  onChange={(e) => {
                                    const allergies = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                    form.setValue("attributes.allergies", allergies);
                                  }}
                                  data-testid="input-allergies"
                                />
                              </div>

                              {/* Blood Type */}
                              <div className="space-y-2">
                                <Label>Blood Type</Label>
                                <Select onValueChange={(value) => form.setValue("attributes.bloodType", value)}>
                                  <SelectTrigger data-testid="select-blood-type">
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Medications */}
                              <div className="space-y-2 md:col-span-2">
                                <Label>Current Medications</Label>
                                <Input
                                  placeholder="e.g., metformin, lisinopril, ibuprofen (comma-separated)"
                                  onChange={(e) => {
                                    const medications = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                                    form.setValue("attributes.medications", medications);
                                  }}
                                  data-testid="input-medications"
                                />
                                <p className="text-xs text-muted-foreground">Include prescription and over-the-counter medications</p>
                              </div>
                            </div>
                            
                            <Alert>
                              <Heart className="h-4 w-4" />
                              <AlertDescription>
                                Only selected medical information will be cryptographically verified. Your actual medical data remains private and secure.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                        {selectedProofType === "insurance_verification" && (
                          <>
                            <div className="space-y-2">
                              <Label>Insurance Type</Label>
                              <Select onValueChange={(value) => form.setValue("attributes.insuranceType", value)}>
                                <SelectTrigger data-testid="select-insurance-type">
                                  <SelectValue placeholder="Select insurance type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="health">Health Insurance</SelectItem>
                                  <SelectItem value="auto">Auto Insurance</SelectItem>
                                  <SelectItem value="home">Home Insurance</SelectItem>
                                  <SelectItem value="life">Life Insurance</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Insurance Status</Label>
                              <Select onValueChange={(value) => form.setValue("attributes.insuranceStatus", value)}>
                                <SelectTrigger data-testid="select-insurance-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active Coverage</SelectItem>
                                  <SelectItem value="pending">Pending Approval</SelectItem>
                                  <SelectItem value="expired">Recently Expired</SelectItem>
                                  <SelectItem value="suspended">Temporarily Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        {selectedProofType === "police_verification" && (
                          <div className="space-y-2">
                            <Label>Badge Number</Label>
                            <Input
                              placeholder="Officer badge number"
                              onChange={(e) => form.setValue("attributes.badgeNumber", e.target.value)}
                              data-testid="input-badge-number"
                            />
                          </div>
                        )}
                      </div>

                      {/* Universal Expiration Setting */}
                      <div className="space-y-2">
                        <Label>Proof Expiration</Label>
                        <Select 
                          value={selectedExpiration.toString()} 
                          onValueChange={(value) => {
                            const days = parseInt(value);
                            setSelectedExpiration(days);
                            form.setValue("attributes.expiresInDays", days);
                          }}
                        >
                          <SelectTrigger data-testid="select-expiration">
                            <SelectValue placeholder="Select expiration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day (Emergency)</SelectItem>
                            <SelectItem value="7">1 Week (Short-term)</SelectItem>
                            <SelectItem value="30">30 Days (Standard)</SelectItem>
                            <SelectItem value="90">90 Days (Extended)</SelectItem>
                            <SelectItem value="365">1 Year (Long-term)</SelectItem>
                            <SelectItem value="0">No Expiration</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {selectedExpiration === 0 ? "Proof will not expire automatically" : `Proof will expire after ${selectedExpiration} day(s)`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      {...form.register("purpose")}
                      placeholder="Explain why this proof is needed..."
                      className="min-h-[100px]"
                      data-testid="textarea-purpose"
                    />
                    {form.formState.errors.purpose && (
                      <p className="text-sm text-destructive">{form.formState.errors.purpose.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button 
                      type="submit" 
                      disabled={createProofMutation.isPending}
                      data-testid="button-submit-zk-proof"
                    >
                      {createProofMutation.isPending ? "Creating..." : "Create ZK Proof"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreating(false);
                        form.reset();
                      }}
                      data-testid="button-cancel-zk-proof"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ZK Proofs List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Your ZK Proofs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {zkProofs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-16 w-16 mx-auto mb-4 opacity-50 text-purple-500" />
                  <h3 className="text-lg font-medium mb-2">No ZK Proofs Yet</h3>
                  <p className="mb-4">Create your first zero-knowledge proof to share data privately</p>
                  <Button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center space-x-2"
                    data-testid="button-create-first-zk-proof"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Your First ZK Proof</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {zkProofs.map((proof, index) => {
                    const privacyLevel = getProofPrivacyLevel(proof.proofType);
                    
                    return (
                      <div key={proof.id}>
                        <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            proof.proofType === "medical_verification" ? "bg-red-100 dark:bg-red-900/20 text-red-600" :
                            proof.proofType === "police_verification" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                            proof.proofType === "insurance_verification" ? "bg-green-100 dark:bg-green-900/20 text-green-600" :
                            "bg-purple-100 dark:bg-purple-900/20 text-purple-600"
                          }`}>
                            {getProofIcon(proof.proofType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-foreground" data-testid={`proof-type-${proof.id}`}>
                                {getProofTypeLabel(proof.proofType)}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  data-testid={`proof-status-${proof.id}`}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Generated
                                </Badge>
                                <Badge 
                                  className="text-xs text-white bg-purple-500"
                                  data-testid={`proof-privacy-${proof.id}`}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Level {privacyLevel}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`proof-result-${proof.id}`}>
                              {proof.proofResult}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center" data-testid={`proof-date-${proof.id}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(proof.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                              </span>
                              <span className="flex items-center">
                                <QrCode className="h-3 w-3 mr-1" />
                                QR Code Available
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${window.location.origin}/verify-proof/${proof.id}`)}
                              className="text-muted-foreground hover:text-foreground"
                              data-testid={`button-copy-proof-${proof.id}`}
                              title="Copy verification link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/verify-proof/${proof.id}`, '_blank')}
                              className="text-muted-foreground hover:text-foreground"
                              data-testid={`button-share-proof-${proof.id}`}
                              title="Open verification link"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {index < zkProofs.length - 1 && <Separator className="my-2" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ZK Proof Info */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Zero-Knowledge Proofs:</strong> These proofs allow you to verify claims about your data 
              (like age, income, or medical status) without revealing the actual data. Medical proofs use Level 6 
              security, while police verification uses Level 5 for maximum privacy and authenticity.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    </div>
  );
}