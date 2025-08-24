import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Lock,
  Eye,
  Database,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Save
} from "lucide-react";
import type { User } from "@shared/schema";

interface DashboardData {
  user: User;
  accessRequests: any[];
}

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  securityAlerts: z.boolean(),
  privacyLevel: z.number().min(0).max(6),
  twoFactorAuth: z.boolean(),
  dataRetention: z.enum(["30_days", "90_days", "1_year", "forever"]),
  autoLogout: z.enum(["15_min", "1_hour", "4_hours", "never"]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: dashboardData, isLoading: dataLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];
  const user = dashboardData?.user;

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      securityAlerts: true,
      privacyLevel: user?.privacyLevel || 4,
      twoFactorAuth: false,
      dataRetention: "1_year",
      autoLogout: "1_hour",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: SettingsFormData) => {
    setIsLoading(true);
    updateSettingsMutation.mutate(data);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be ready shortly and sent to your email.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This action requires additional verification. Check your email for next steps.",
      variant: "destructive",
    });
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} pendingRequestsCount={pendingRequests.length} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-48"></div>
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
              <h1 className="text-3xl font-bold" data-testid="title-settings">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and privacy settings
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Privacy Level {user?.privacyLevel || 0}</span>
            </Badge>
          </div>

          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Privacy & Security */}
              <Card data-testid="card-privacy-security">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Privacy Level (0-6)</Label>
                    <Select 
                      value={form.watch("privacyLevel").toString()} 
                      onValueChange={(value) => form.setValue("privacyLevel", parseInt(value))}
                    >
                      <SelectTrigger data-testid="select-privacy-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Level 0 - Public</SelectItem>
                        <SelectItem value="1">Level 1 - Basic</SelectItem>
                        <SelectItem value="2">Level 2 - Standard</SelectItem>
                        <SelectItem value="3">Level 3 - Enhanced</SelectItem>
                        <SelectItem value="4">Level 4 - High</SelectItem>
                        <SelectItem value="5">Level 5 - Maximum</SelectItem>
                        <SelectItem value="6">Level 6 - Ultra Secure</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Higher levels provide more data protection but may limit functionality
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch 
                      checked={form.watch("twoFactorAuth")}
                      onCheckedChange={(checked) => form.setValue("twoFactorAuth", checked)}
                      data-testid="switch-2fa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Auto Logout</Label>
                    <Select 
                      value={form.watch("autoLogout")} 
                      onValueChange={(value: any) => form.setValue("autoLogout", value)}
                    >
                      <SelectTrigger data-testid="select-auto-logout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15_min">15 minutes</SelectItem>
                        <SelectItem value="1_hour">1 hour</SelectItem>
                        <SelectItem value="4_hours">4 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card data-testid="card-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch 
                      checked={form.watch("emailNotifications")}
                      onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Browser and mobile alerts
                      </p>
                    </div>
                    <Switch 
                      checked={form.watch("pushNotifications")}
                      onCheckedChange={(checked) => form.setValue("pushNotifications", checked)}
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical security notifications
                      </p>
                    </div>
                    <Switch 
                      checked={form.watch("securityAlerts")}
                      onCheckedChange={(checked) => form.setValue("securityAlerts", checked)}
                      data-testid="switch-security-alerts"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Management */}
            <Card data-testid="card-data-management">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Data Retention Period</Label>
                    <Select 
                      value={form.watch("dataRetention")} 
                      onValueChange={(value: any) => form.setValue("dataRetention", value)}
                    >
                      <SelectTrigger data-testid="select-data-retention">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30_days">30 days</SelectItem>
                        <SelectItem value="90_days">90 days</SelectItem>
                        <SelectItem value="1_year">1 year</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How long to keep your audit logs and activity data
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleExportData}
                      className="w-full flex items-center space-x-2"
                      data-testid="button-export-data"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export My Data</span>
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full flex items-center space-x-2"
                      data-testid="button-import-data"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import Data</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card data-testid="card-account-actions">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These actions are permanent and cannot be undone. Please proceed with caution.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2"
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will permanently delete your account and all associated data
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || updateSettingsMutation.isPending}
                className="flex items-center space-x-2"
                data-testid="button-save-settings"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}