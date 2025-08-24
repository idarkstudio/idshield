import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Camera, 
  FileText,
  Plus,
  X
} from "lucide-react";

interface DocumentUploaderProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentFormData {
  name: string;
  privacyLevel: number;
  documentType: string;
  description: string;
}

export default function DocumentUploader({ category, isOpen, onClose }: DocumentUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [formData, setFormData] = useState<DocumentFormData>({
    name: "",
    privacyLevel: 5,
    documentType: "",
    description: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const saveDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/vault-items", data);
    },
    onSuccess: () => {
      toast({
        title: "Document Saved",
        description: "Document has been added to your vault successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save document",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setUploadedFileUrl("");
    setFormData({
      name: "",
      privacyLevel: 5,
      documentType: "",
      description: "",
    });
    setIsScanning(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10485760) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      
      const uploadResponse = await fetch(response.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      
      if (uploadResponse.ok) {
        setUploadedFileUrl(response.uploadURL);
        toast({
          title: "Upload Complete",
          description: "Document uploaded successfully. Now add details.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      setIsScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Unable to access camera. Please use file upload instead.",
        variant: "destructive",
      });
    }
  };

  const captureDocument = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setIsUploading(true);
      try {
        const response = await apiRequest("POST", "/api/objects/upload");
        const uploadResponse = await fetch(response.uploadURL, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": "image/jpeg",
          },
        });
        
        if (uploadResponse.ok) {
          setUploadedFileUrl(response.uploadURL);
          setIsScanning(false);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
          toast({
            title: "Document Captured",
            description: "Document scanned successfully. Now add details.",
          });
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload scanned document.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }, "image/jpeg", 0.9);
  };

  const handleSaveDocument = async () => {
    if (!uploadedFileUrl || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please upload a document and fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const documentData = {
      category,
      name: formData.name,
      privacyLevel: formData.privacyLevel,
      data: {
        type: formData.documentType,
        description: formData.description,
        fileUrl: uploadedFileUrl,
        uploadedAt: new Date().toISOString(),
      },
    };

    saveDocumentMutation.mutate(documentData);
  };

  const getDocumentTypes = () => {
    switch (category) {
      case "health":
        return [
          { value: "medical_records", label: "Medical Records" },
          { value: "prescription", label: "Prescription" },
          { value: "test_results", label: "Test Results" },
          { value: "insurance_card", label: "Insurance Card" },
          { value: "vaccination", label: "Vaccination Record" },
        ];
      case "insurance":
        return [
          { value: "policy_document", label: "Policy Document" },
          { value: "insurance_card", label: "Insurance Card" },
          { value: "claim_form", label: "Claim Form" },
          { value: "coverage_summary", label: "Coverage Summary" },
        ];
      case "ids":
        return [
          { value: "drivers_license", label: "Driver's License" },
          { value: "passport", label: "Passport" },
          { value: "national_id", label: "National ID" },
          { value: "birth_certificate", label: "Birth Certificate" },
          { value: "social_security", label: "Social Security Card" },
        ];
      default:
        return [
          { value: "document", label: "Document" },
          { value: "certificate", label: "Certificate" },
          { value: "form", label: "Form" },
        ];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          {!uploadedFileUrl && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setIsScanning(false)}
                  variant={!isScanning ? "default" : "outline"}
                  className="flex items-center space-x-2"
                  disabled={isUploading}
                >
                  <FileText className="h-4 w-4" />
                  <span>Upload File</span>
                </Button>
                <Button
                  onClick={startScanning}
                  variant={isScanning ? "default" : "outline"}
                  className="flex items-center space-x-2"
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                  <span>Scan Document</span>
                </Button>
              </div>

              {!isScanning ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium">Upload Document</h3>
                      <p className="text-muted-foreground">
                        Select a file to upload (PDF, DOC, JPG, PNG - Max 10MB)
                      </p>
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{isUploading ? "Uploading..." : "Choose File"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg border"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={captureDocument} 
                      disabled={isUploading}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{isUploading ? "Processing..." : "Capture"}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsScanning(false);
                        if (stream) {
                          stream.getTracks().forEach(track => track.stop());
                          setStream(null);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document Details Form */}
          {uploadedFileUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Document uploaded successfully! Now add the details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Document Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                    data-testid="input-document-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select 
                    value={formData.documentType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
                  >
                    <SelectTrigger data-testid="select-document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDocumentTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacyLevel">Privacy Level</Label>
                  <Select 
                    value={formData.privacyLevel.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, privacyLevel: parseInt(value) }))}
                  >
                    <SelectTrigger data-testid="select-privacy-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Level 3 - Enhanced</SelectItem>
                      <SelectItem value="4">Level 4 - High</SelectItem>
                      <SelectItem value="5">Level 5 - Maximum (Recommended)</SelectItem>
                      <SelectItem value="6">Level 6 - Ultra Secure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add any additional notes about this document..."
                  className="min-h-[80px]"
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveDocument} 
                  disabled={saveDocumentMutation.isPending}
                  data-testid="button-save-document"
                >
                  {saveDocumentMutation.isPending ? "Saving..." : "Save Document"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}