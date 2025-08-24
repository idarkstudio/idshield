import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  User, 
  Calendar,
  AlertTriangle,
  Key,
  Users,
  Building,
  Heart,
  Car,
  Lock
} from "lucide-react";
import { format } from "date-fns";

interface VerificationData {
  valid: boolean;
  proof?: {
    id: string;
    proofType: string;
    proofResult: string;
    createdAt: string;
    attributes?: any;
  };
  error?: string;
}

export default function VerifyProof() {
  const params = useParams();
  const proofId = params.id;

  const { data: verification, isLoading } = useQuery<VerificationData>({
    queryKey: ["/api/verify-proof", proofId],
    queryFn: async () => {
      const response = await fetch(`/api/verify-proof/${proofId}`);
      if (!response.ok) {
        throw new Error("Failed to verify proof");
      }
      return response.json();
    },
    enabled: !!proofId,
  });

  const getProofIcon = (type: string) => {
    switch (type) {
      case "age_verification":
        return <Users className="h-6 w-6" />;
      case "income_verification":
        return <Building className="h-6 w-6" />;
      case "identity_verification":
        return <Key className="h-6 w-6" />;
      case "medical_verification":
        return <Heart className="h-6 w-6" />;
      case "insurance_verification":
        return <Shield className="h-6 w-6" />;
      case "police_verification":
        return <Car className="h-6 w-6" />;
      default:
        return <Lock className="h-6 w-6" />;
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

  const getPrivacyLevelBadge = (type: string) => {
    const levels = {
      medical_verification: { level: 0, name: "Absolute Confidential" },
      police_verification: { level: 1, name: "Controlled Sensitive" },
      insurance_verification: { level: 2, name: "Private Information" },
      income_verification: { level: 3, name: "Internal Information" },
      identity_verification: { level: 4, name: "Controlled Public" },
      age_verification: { level: 5, name: "ZK Proof Access" },
    };
    return levels[type as keyof typeof levels] || { level: 3, name: "Internal Information" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verification || !verification.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <span>Proof Verification Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {verification?.error || "Invalid or expired proof. Please check the link and try again."}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const proof = verification.proof!;
  const privacyInfo = getPrivacyLevelBadge(proof.proofType);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl glow-card" data-testid="card-proof-verification">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <span>Proof Verified Successfully</span>
          </CardTitle>
          <p className="text-muted-foreground">
            This zero-knowledge proof has been cryptographically verified
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Proof Type */}
          <div className="flex items-center justify-center space-x-4 p-6 bg-muted/50 rounded-lg">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              proof.proofType === "medical_verification" ? "bg-red-100 dark:bg-red-900/20 text-red-600" :
              proof.proofType === "police_verification" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
              proof.proofType === "insurance_verification" ? "bg-green-100 dark:bg-green-900/20 text-green-600" :
              "bg-purple-100 dark:bg-purple-900/20 text-purple-600"
            }`}>
              {getProofIcon(proof.proofType)}
            </div>
            <div>
              <h3 className="text-xl font-semibold" data-testid="proof-type">
                {getProofTypeLabel(proof.proofType)}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="bg-green-100 text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
                <Badge className="bg-purple-600 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Level {privacyInfo.level} - {privacyInfo.name}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Proof Result */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Verification Result</span>
            </h4>
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200" data-testid="proof-result">
                ✓ {proof.proofResult}
              </p>
            </div>
          </div>

          {/* Proof Details */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Proof Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Proof ID:</span>
                <p className="font-mono text-xs break-all" data-testid="proof-id">{proof.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Generated:</span>
                </span>
                <p data-testid="proof-date">
                  {format(new Date(proof.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Expiration Info */}
          {proof.attributes?.expiresInDays && proof.attributes.expiresInDays > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Expiration</span>
              </h4>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This proof will expire {proof.attributes.expiresInDays} days after generation.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Protected:</strong> This verification confirms the claim without revealing 
              any underlying personal data. The proof was generated using zero-knowledge cryptography.
            </AlertDescription>
          </Alert>

          <div className="text-center pt-4">
            <Button onClick={() => window.history.back()} data-testid="button-go-back">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}