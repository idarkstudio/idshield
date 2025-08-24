import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Scan, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText,
  Camera,
  Hash
} from "lucide-react";

interface VerificationEvent {
  id: string;
  timestamp: Date;
  officerId: string;
  result: "valid" | "invalid";
  proofData?: string;
  plateNumber?: string;
  method: "qr" | "plate";
}

type CheckState = "await_scan" | "verifying" | "green_ok" | "red_fail";

export default function PoliceCheck() {
  const [, setLocation] = useLocation();
  const [checkState, setCheckState] = useState<CheckState>("await_scan");
  const [qrInput, setQrInput] = useState("");
  const [plateInput, setPlateInput] = useState("");
  const [currentResult, setCurrentResult] = useState<{
    isValid: boolean;
    message: string;
    proofType?: string;
  } | null>(null);
  const [eventLog, setEventLog] = useState<VerificationEvent[]>([]);
  const [officerId] = useState("OFFICER_001"); // In real app, this would come from auth
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const session = localStorage.getItem('idshield_session');
    if (!session) {
      setLocation('/login');
    }
  }, [setLocation]);

  const mockVerifyZKProof = async (proofData: string): Promise<boolean> => {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock verification logic - in real app this would verify the actual ZK proof
    // For demo, we'll consider proofs containing "insurance" as valid
    return proofData.includes("insurance") || proofData.includes("zk_proof") || Math.random() > 0.3;
  };

  const mockVerifyPlate = async (plateNumber: string): Promise<boolean> => {
    // Simulate plate lookup delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock plate verification - some plates are valid
    const validPlates = ["ABC123", "XYZ789", "DEF456"];
    return validPlates.includes(plateNumber.toUpperCase()) || Math.random() > 0.4;
  };

  const logEvent = (result: "valid" | "invalid", method: "qr" | "plate", data?: string) => {
    const event: VerificationEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date(),
      officerId,
      result,
      method,
      proofData: method === "qr" ? data : undefined,
      plateNumber: method === "plate" ? data : undefined,
    };
    
    setEventLog(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
  };

  const handleQRScan = async () => {
    if (!qrInput.trim()) return;
    
    setCheckState("verifying");
    
    try {
      const isValid = await mockVerifyZKProof(qrInput);
      
      setCurrentResult({
        isValid,
        message: isValid 
          ? "Coverage valid - Policy is active" 
          : "Invalid or expired coverage",
        proofType: "Insurance Coverage"
      });
      
      logEvent(isValid ? "valid" : "invalid", "qr", qrInput);
      setCheckState(isValid ? "green_ok" : "red_fail");
      
      // Auto reset after 3 seconds
      setTimeout(() => {
        setCheckState("await_scan");
        setQrInput("");
        setCurrentResult(null);
      }, 3000);
      
    } catch (error) {
      setCurrentResult({
        isValid: false,
        message: "Error verifying proof"
      });
      setCheckState("red_fail");
      logEvent("invalid", "qr", qrInput);
    }
  };

  const handlePlateScan = async () => {
    if (!plateInput.trim()) return;
    
    setCheckState("verifying");
    
    try {
      const isValid = await mockVerifyPlate(plateInput);
      
      setCurrentResult({
        isValid,
        message: isValid 
          ? "Vehicle registration valid" 
          : "Invalid or expired registration",
      });
      
      logEvent(isValid ? "valid" : "invalid", "plate", plateInput.toUpperCase());
      setCheckState(isValid ? "green_ok" : "red_fail");
      
      // Auto reset after 3 seconds
      setTimeout(() => {
        setCheckState("await_scan");
        setPlateInput("");
        setCurrentResult(null);
      }, 3000);
      
    } catch (error) {
      setCurrentResult({
        isValid: false,
        message: "Error verifying plate"
      });
      setCheckState("red_fail");
      logEvent("invalid", "plate", plateInput);
    }
  };

  const getStateDisplay = () => {
    switch (checkState) {
      case "await_scan":
        return {
          title: "Ready to Scan",
          description: "Scan QR code or enter plate number",
          color: "bg-blue-500",
          icon: Scan
        };
      case "verifying":
        return {
          title: "Verifying...",
          description: "Checking proof validity",
          color: "bg-yellow-500",
          icon: Clock
        };
      case "green_ok":
        return {
          title: "VALID ✅",
          description: currentResult?.message || "Verification successful",
          color: "bg-green-500",
          icon: CheckCircle
        };
      case "red_fail":
        return {
          title: "INVALID ❌",
          description: currentResult?.message || "Verification failed",
          color: "bg-red-500",
          icon: XCircle
        };
    }
  };

  const stateInfo = getStateDisplay();
  const StateIcon = stateInfo.icon;

  return (
    <div className="min-h-screen bg-background dark:bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground" data-testid="title-police-check">
            Police Verification Panel
          </h1>
          <p className="text-muted-foreground">
            Scan QR codes or verify license plates for coverage validation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Verification Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current State Display */}
            <Card className="border-2" data-testid="card-verification-state">
              <CardContent className="p-8 text-center">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${stateInfo.color}`}>
                  <StateIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-state-title">
                  {stateInfo.title}
                </h2>
                <p className="text-muted-foreground text-lg" data-testid="text-state-description">
                  {stateInfo.description}
                </p>
                {currentResult?.proofType && (
                  <Badge variant="outline" className="mt-2">
                    {currentResult.proofType}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Scanning Interface */}
            {checkState === "await_scan" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Code Scanner */}
                <Card data-testid="card-qr-scanner">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Scan className="w-5 h-5" />
                      <span>QR Code Scanner</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="qr-input" className="text-sm font-medium">
                        Paste QR Code Data
                      </label>
                      <Input
                        id="qr-input"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="zk_proof_..."
                        className="font-mono text-sm"
                        data-testid="input-qr-code"
                      />
                    </div>
                    <Button 
                      onClick={handleQRScan}
                      disabled={!qrInput.trim() || checkState !== "await_scan"}
                      className="w-full"
                      data-testid="button-verify-qr"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Verify ZK Proof
                    </Button>
                  </CardContent>
                </Card>

                {/* License Plate Scanner */}
                <Card data-testid="card-plate-scanner">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Hash className="w-5 h-5" />
                      <span>License Plate</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="plate-input" className="text-sm font-medium">
                        Enter Plate Number
                      </label>
                      <Input
                        id="plate-input"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                        placeholder="ABC123"
                        className="font-mono text-sm"
                        data-testid="input-plate-number"
                      />
                    </div>
                    <Button 
                      onClick={handlePlateScan}
                      disabled={!plateInput.trim() || checkState !== "await_scan"}
                      className="w-full"
                      data-testid="button-verify-plate"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Verify Registration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Event Log Sidebar */}
          <div className="space-y-6">
            <Card data-testid="card-event-log">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Event Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventLog.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events yet</p>
                ) : (
                  eventLog.map((event, index) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border space-y-2"
                      data-testid={`event-log-item-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={event.result === "valid" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {event.result === "valid" ? "✅ VALID" : "❌ INVALID"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3" />
                          <span className="font-mono text-xs">{event.officerId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.method === "qr" ? (
                            <Scan className="w-3 h-3" />
                          ) : (
                            <Hash className="w-3 h-3" />
                          )}
                          <span className="text-xs">
                            {event.method === "qr" ? "QR Scan" : "Plate Check"}
                          </span>
                        </div>
                        {(event.proofData || event.plateNumber) && (
                          <div className="text-xs font-mono text-muted-foreground truncate">
                            {event.proofData || event.plateNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Officer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Officer Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Badge ID:</span>
                    <span className="text-sm font-mono" data-testid="text-officer-id">
                      {officerId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Session:</span>
                    <span className="text-sm font-mono">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Checks:</span>
                    <span className="text-sm font-mono" data-testid="text-check-count">
                      {eventLog.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}