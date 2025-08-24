import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Check, QrCode, Download } from "lucide-react";
import QRCode from "qrcode";

const generateProofSchema = z.object({
  proofType: z.string().min(1, "Proof type is required"),
  attributes: z.array(z.string()).min(1, "At least one attribute is required"),
  proofResult: z.string().default(""),
});

type GenerateProofForm = z.infer<typeof generateProofSchema>;

interface GenerateProofModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proofTypes = [
  {
    value: "age_verification",
    label: "Age Verification (18+)",
    attributes: ["birth_date", "country"],
  },
  {
    value: "income_range",
    label: "Income Range Proof",
    attributes: ["income_bracket", "employment_status"],
  },
  {
    value: "insurance",
    label: "Insurance Coverage Proof",
    attributes: ["coverage_type", "provider", "policy_status"],
  },
  {
    value: "residency",
    label: "Residency Proof",
    attributes: ["address", "country", "state"],
  },
  {
    value: "education",
    label: "Education Credential",
    attributes: ["degree", "institution", "graduation_date"],
  },
];

const attributeLabels: Record<string, string> = {
  birth_date: "Birth date (for age calculation)",
  country: "Country of residence",
  income_bracket: "Income bracket",
  employment_status: "Employment status",
  coverage_type: "Insurance coverage type",
  provider: "Insurance provider",
  policy_status: "Policy status",
  address: "Address",
  state: "State/Province",
  degree: "Degree/Certification",
  institution: "Educational institution",
  graduation_date: "Graduation date",
};

export default function GenerateProofModal({ open, onOpenChange }: GenerateProofModalProps) {
  const [selectedProofType, setSelectedProofType] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GenerateProofForm>({
    resolver: zodResolver(generateProofSchema),
    defaultValues: {
      proofType: "",
      attributes: [],
      proofResult: "",
    },
  });

  const generateQRCode = async (proofData: string) => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, proofData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Convert canvas to data URL for easier handling
        const dataUrl = canvasRef.current.toDataURL();
        setQrCodeData(dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateProofMutation = useMutation({
    mutationFn: (data: GenerateProofForm) => 
      apiRequest("POST", "/api/generate-proof", data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      const mockProofResult = `zk_proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setGeneratedProof(mockProofResult);
      
      // Generate QR code for the proof
      await generateQRCode(mockProofResult);
      
      setIsGenerating(false);
      
      toast({
        title: "ZK Proof Generated",
        description: "Your zero-knowledge proof and QR code have been created successfully",
      });
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate proof. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProofTypeChange = (value: string) => {
    setSelectedProofType(value);
    setSelectedAttributes([]);
    form.setValue("proofType", value);
    form.setValue("attributes", []);
  };

  const handleAttributeChange = (attribute: string, checked: boolean) => {
    let newAttributes;
    if (checked) {
      newAttributes = [...selectedAttributes, attribute];
    } else {
      newAttributes = selectedAttributes.filter(attr => attr !== attribute);
    }
    setSelectedAttributes(newAttributes);
    form.setValue("attributes", newAttributes);
  };

  const onSubmit = (data: GenerateProofForm) => {
    setIsGenerating(true);
    // Simulate proof generation delay
    setTimeout(() => {
      generateProofMutation.mutate({
        ...data,
        proofResult: `Generated proof for ${data.proofType}`,
      });
    }, 2000);
  };

  const downloadQRCode = () => {
    if (qrCodeData) {
      const link = document.createElement('a');
      link.download = `zk-proof-qr-${Date.now()}.png`;
      link.href = qrCodeData;
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code has been saved to your downloads",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedProofType("");
    setSelectedAttributes([]);
    setGeneratedProof("");
    setQrCodeData("");
    setIsGenerating(false);
  };

  const currentProofType = proofTypes.find(type => type.value === selectedProofType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-generate-proof">
        <DialogHeader>
          <DialogTitle>Generate ZK Proof</DialogTitle>
          <DialogDescription>
            Create a zero-knowledge proof to verify information without revealing your actual data.
          </DialogDescription>
        </DialogHeader>

        {!generatedProof ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proofType">Proof Type</Label>
              <Select 
                value={selectedProofType} 
                onValueChange={handleProofTypeChange}
              >
                <SelectTrigger data-testid="select-proof-type">
                  <SelectValue placeholder="Select proof type" />
                </SelectTrigger>
                <SelectContent>
                  {proofTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.proofType && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.proofType.message}
                </p>
              )}
            </div>

            {currentProofType && (
              <div className="space-y-2">
                <Label>Select Attributes</Label>
                <div className="space-y-2">
                  {currentProofType.attributes.map((attribute) => (
                    <div key={attribute} className="flex items-center space-x-2">
                      <Checkbox
                        id={attribute}
                        checked={selectedAttributes.includes(attribute)}
                        onCheckedChange={(checked) => 
                          handleAttributeChange(attribute, checked as boolean)
                        }
                        data-testid={`checkbox-attribute-${attribute}`}
                      />
                      <Label htmlFor={attribute} className="text-sm">
                        {attributeLabels[attribute] || attribute}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.attributes && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.attributes.message}
                  </p>
                )}
              </div>
            )}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Privacy Protected</span>
                </div>
                <p className="mt-1">Only the proof result will be shared, not your actual data.</p>
              </AlertDescription>
            </Alert>

            {isGenerating && (
              <Alert>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <AlertDescription>
                  <span className="font-medium">Generating Proof...</span>
                  <p className="mt-1">This may take a few moments.</p>
                </AlertDescription>
              </Alert>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="border-success bg-success/10">
              <Check className="h-4 w-4 text-success" />
              <AlertDescription>
                <span className="font-medium text-success">Proof Generated Successfully!</span>
                <p className="mt-1">Your zero-knowledge proof and QR code are ready to be shared.</p>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proof Result</Label>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm" data-testid="text-proof-result">
                  {generatedProof}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex flex-col items-center space-y-2">
                  <canvas 
                    ref={canvasRef} 
                    className="border rounded-lg bg-white"
                    data-testid="canvas-qr-code"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    disabled={!qrCodeData}
                    data-testid="button-download-qr"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            data-testid="button-cancel-proof"
          >
            {generatedProof ? "Close" : "Cancel"}
          </Button>
          {!generatedProof && (
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={generateProofMutation.isPending || isGenerating || !selectedProofType || selectedAttributes.length === 0}
              data-testid="button-generate-proof"
            >
              {isGenerating ? "Generating..." : "Generate Proof"}
            </Button>
          )}
          {generatedProof && (
            <Button data-testid="button-copy-proof">
              Copy Proof
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
