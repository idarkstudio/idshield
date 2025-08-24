import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import logoImage from "@assets/horizontal_1756043627119.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Zap
} from "lucide-react";

interface LaceAPI {
  enable(): Promise<any>;
  getNetworkId(): Promise<number>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  signData(address: string, payload: Uint8Array): Promise<{ key: string; signature: string }>;
}

interface SignInPayload {
  address: string;
  nonce: string;
  signature: string;
  key: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<{ message: string; type: 'idle' | 'success' | 'warning' | 'error' }>({
    message: 'waiting...',
    type: 'idle'
  });
  const [session, setSession] = useState<SignInPayload | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [api, setApi] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<'idle' | 'verifying'>('idle');

  // Helper functions
  const hexToUtf8 = (hex: string) => {
    const bytes = hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  const toHex = (u8: Uint8Array) => 
    Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');

  const randomNonce = () => crypto.getRandomValues(new Uint8Array(24));

  const handleDetect = () => {
    const found = !!(window as any).cardano?.lace;
    setStatus({
      message: found ? 'Lace detected' : 'Lace NOT detected',
      type: found ? 'success' : 'warning'
    });
  };


  const handleConnectAndSignIn = async () => {
    try {
      setCheckState('verifying');
      
      // Step 1: Connect to wallet if not already connected
      if (!api) {
        if (!(window as any).cardano?.lace) {
          throw new Error('Lace not found. Install the extension.');
        }

        const laceApi = await (window as any).cardano.lace.enable();
        const networkId = await laceApi.getNetworkId();
        const used = await laceApi.getUsedAddresses();
        const unused = await laceApi.getUnusedAddresses();
        const walletAddress = (used[0] ?? unused[0]) || null;

        setApi(laceApi);
        setAddress(walletAddress);
        
        setDebug({
          networkId,
          usedCount: used.length,
          hasUnused: !!unused.length,
          address: walletAddress
        });

        // Use the newly connected API and address
        const currentApi = laceApi;
        const currentAddress = walletAddress;

        // Step 2: Sign in with the connected wallet
        if (!currentApi || !currentAddress) {
          throw new Error('Failed to connect wallet.');
        }

        // Create a nonce and sign the message
        const nonce = randomNonce();
        const nonceHex = toHex(nonce);
        const messageText = `IDShield Login\nnonce:${nonceHex}\norigin:${location.origin}`;
        const messageBytes = new TextEncoder().encode(messageText);
        const messageHex = toHex(messageBytes);

        // CIP-30 signData expects hex string for the payload
        const sig = await currentApi.signData(currentAddress, messageHex);

        const payload: SignInPayload = {
          address: currentAddress,
          nonce: nonceHex,
          signature: sig.signature,
          key: sig.key
        };

        setStatus({
          message: 'Signed in successfully! Redirecting to dashboard...',
          type: 'success'
        });
        
        setSession(payload);

        // Store session and redirect
        setTimeout(() => {
          localStorage.setItem('idshield_session', JSON.stringify(payload));
          setLocation('/dashboard');
        }, 2000);

      } else {
        // Already connected, just sign in
        if (!address) {
          throw new Error('No wallet address found.');
        }

        // Create a nonce and sign the message
        const nonce = randomNonce();
        const nonceHex = toHex(nonce);
        const messageText = `IDShield Login\nnonce:${nonceHex}\norigin:${location.origin}`;
        const messageBytes = new TextEncoder().encode(messageText);
        const messageHex = toHex(messageBytes);

        // CIP-30 signData expects hex string for the payload
        const sig = await api.signData(address, messageHex);

        const payload: SignInPayload = {
          address,
          nonce: nonceHex,
          signature: sig.signature,
          key: sig.key
        };

        setStatus({
          message: 'Signed in successfully! Redirecting to dashboard...',
          type: 'success'
        });
        
        setSession(payload);

        // Store session and redirect
        setTimeout(() => {
          localStorage.setItem('idshield_session', JSON.stringify(payload));
          setLocation('/dashboard');
        }, 2000);
      }

    } catch (err: any) {
      console.error(err);
      setStatus({
        message: `Connection/Sign-in failed: ${err.message}`,
        type: 'error'
      });
    } finally {
      setCheckState('idle');
    }
  };

  useEffect(() => {
    // Auto-detect on page load
    handleDetect();
  }, []);

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="ID Shield" 
              className="h-16 w-auto"
              data-testid="logo-main"
            />
          </div>
          <p className="text-muted-foreground text-lg">
            Sign in with <strong>Lace Wallet</strong>
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Login for IDShield. Your private key never leaves the wallet.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 glow-card" data-testid="card-login">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-6 h-6" />
              <span>Wallet Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleDetect}
                data-testid="button-detect"
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Detect Lace
              </Button>
              <Button
                onClick={handleConnectAndSignIn}
                data-testid="button-connect-signin"
                className="w-full"
                disabled={checkState === "verifying"}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {checkState === "verifying" ? "Processing..." : "Connect & Sign In"}
              </Button>
            </div>

            {/* Status */}
            <Alert data-testid="alert-status">
              <div className="flex items-center space-x-2">
                <div className={getStatusColor()}>
                  {getStatusIcon()}
                </div>
                <AlertDescription className={getStatusColor()}>
                  <strong>Status:</strong> {status.message}
                </AlertDescription>
              </div>
            </Alert>

            {/* Session Data */}
            {session && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Session</h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-auto max-h-48">
                  <pre data-testid="session-data">{JSON.stringify(session, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {debug && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Debug</h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-auto max-h-48">
                  <pre data-testid="debug-data">{JSON.stringify(debug, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-white">
            💡 <strong>Tip:</strong> If Lace isn't detected, install the{' '}
            <a 
              href="https://www.lace.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline hover:text-gray-200 transition-colors"
            >
              wallet
            </a>{' '}
            extension and refresh.
          </p>
          <div className="mt-2">
            <a 
              href="https://lu.ma/4uq8yejo?tk=zxwwek" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Badge variant="outline" className="hover:bg-muted/50 transition-colors cursor-pointer">
                Product Develop for Midnight Hackathon Buenos Aires
              </Badge>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}