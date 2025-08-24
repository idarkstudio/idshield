import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  Users, 
  UserCheck, 
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import type { User, VaultItem } from "@shared/schema";

interface DashboardData {
  user: User;
  vaultItems: VaultItem[];
  accessRequests: any[];
}

export default function PrivacyLevels() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];
  const user = dashboardData?.user;
  const vaultItems = dashboardData?.vaultItems || [];

  const privacyLevels = [
    {
      level: 0,
      name: "Absolute Confidential",
      icon: ShieldAlert,
      color: "text-green-800",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Most sensitive user data. Only you can access.",
      access: "User only - never shared with third parties or applications",
      examples: ["Private keys", "Complete medical history", "Raw biometric data"],
      risks: ["Maximum security", "Always encrypted", "Zero sharing"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 0).length
    },
    {
      level: 1,
      name: "Controlled Sensitive",
      icon: ShieldCheck,
      color: "text-green-600", 
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Very sensitive data with temporary sharing and explicit consent",
      access: "Short-term permissions only (e.g., 24h to doctor), always audited",
      examples: ["Lab results", "Financial details", "Specific medical diagnoses"],
      risks: ["High security", "Temporary access only", "Full audit trail"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 1).length
    },
    {
      level: 2,
      name: "Private Information",
      icon: Lock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20", 
      description: "Private data shared with trusted institutions under contracts",
      access: "Trusted institutions with user permissions and contracts",
      examples: ["Address", "Phone", "Academic/work history"],
      risks: ["Good privacy", "Granular control", "Full traceability"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 2).length
    },
    {
      level: 3,
      name: "Internal Information",
      icon: UserCheck,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      description: "Internal organizational data with privacy agreements",
      access: "Authorized organizations under privacy agreements",
      examples: ["Insurance usage reports", "Internal evaluations", "Company notes"],
      risks: ["Moderate privacy", "Organizational access", "Privacy agreements"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 3).length
    },
    {
      level: 4,
      name: "Controlled Public",
      icon: Users,
      color: "text-orange-600", 
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "User-controlled public or partial sharing",
      access: "User defines what to show and to whom in specific contexts",
      examples: ["Professional profile", "Public certifications", "Social aliases"],
      risks: ["User-controlled exposure", "Context-specific sharing", "Managed visibility"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 4).length
    },
    {
      level: 5,
      name: "ZK Proof Access",
      icon: Eye,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20", 
      description: "Zero-knowledge proofs that verify without revealing actual data",
      access: "Cryptographic proofs verify claims without exposing data",
      examples: ["Prove age >18", "Prove insurance is active", "Income range verification"],
      risks: ["Data remains private", "Only proof verification", "No data exposure"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 5).length
    },
    {
      level: 6,
      name: "Ecosystem Apps",
      icon: Globe,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      description: "Third-party applications built on IDShield with user control", 
      access: "External apps and services under absolute user control",
      examples: ["Hospital apps reading medical records", "Insurance company systems", "Third-party integrations"],
      risks: ["External access", "User-controlled permissions", "Potential monetization"],
      dataCount: vaultItems.filter(item => item.privacyLevel === 6).length
    }
  ];

  const currentLevel = privacyLevels.find(level => level.level === user?.privacyLevel) || privacyLevels[4];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={undefined} pendingRequestsCount={0} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-muted rounded"></div>
                <div className="h-96 bg-muted rounded"></div>
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
              <h1 className="text-3xl font-bold" data-testid="title-privacy-levels">Privacy Levels (0–6)</h1>
              <p className="text-muted-foreground">
                Understand and manage your data privacy levels
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <currentLevel.icon className="w-4 h-4" />
              <span>Current: Level {user?.privacyLevel || 4}</span>
            </Badge>
          </div>

          {/* Current Privacy Level Overview */}
          <Card data-testid="card-current-level">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentLevel.icon className={`h-6 w-6 ${currentLevel.color}`} />
                <span>Your Current Privacy Level: {currentLevel.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-medium mb-2">{currentLevel.description}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      <strong>Access:</strong> {currentLevel.access}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Data at This Level:
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-bold text-2xl text-foreground">{currentLevel.dataCount}</span> vault items
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Examples:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {currentLevel.examples.map((example, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <Progress value={(user?.privacyLevel || 4) * 100 / 6} className="mt-6" />
            </CardContent>
          </Card>

          {/* All Privacy Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {privacyLevels.map((level) => {
              const isCurrentLevel = level.level === user?.privacyLevel;
              
              return (
                <Card 
                  key={level.level} 
                  className={`${isCurrentLevel ? 'ring-2 ring-primary' : ''} ${level.bgColor}`}
                  data-testid={`card-level-${level.level}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <level.icon className={`h-5 w-5 ${level.color}`} />
                        <span>Level {level.level}: {level.name}</span>
                      </div>
                      {isCurrentLevel && (
                        <Badge variant="default" className="text-xs">
                          CURRENT
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{level.description}</p>
                    
                    <div>
                      <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                        Data Count
                      </h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{level.dataCount}</span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                        Access Control
                      </h5>
                      <p className="text-xs text-muted-foreground">{level.access}</p>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                        Protection Level
                      </h5>
                      <div className="flex items-center space-y-1">
                        {level.risks.map((risk, index) => (
                          <span key={index} className="text-xs text-muted-foreground">
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Privacy Tips */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Tip:</strong> Lower privacy levels (0-2) provide maximum protection for sensitive data. 
              Level 0 offers absolute confidentiality, while higher levels (4-6) enable more sharing and functionality.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    </div>
  );
}