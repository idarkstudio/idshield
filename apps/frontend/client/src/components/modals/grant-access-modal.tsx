import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Info, Shield } from "lucide-react";

const grantAccessSchema = z.object({
  requesterName: z.string().min(1, "Requester name is required"),
  requesterEmail: z.string().email("Valid email is required"),
  dataRequested: z.string().min(1, "Data scope is required"),
  purpose: z.string().min(1, "Purpose is required"),
  privacyLevel: z.number().min(1).max(6),
  ttl: z.string().min(1, "Time to live is required"),
});

type GrantAccessForm = z.infer<typeof grantAccessSchema>;

interface GrantAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dataScopes = [
  "Identity Verification",
  "Health Records", 
  "Insurance Information",
  "Financial Data",
  "Educational Credentials",
  "Employment History",
];

const privacyLevels = [
  { level: 1, name: "Basic", description: "Public information only" },
  { level: 2, name: "Standard", description: "Limited personal data" },
  { level: 3, name: "Enhanced", description: "Detailed personal data" },
  { level: 4, name: "High", description: "Sensitive information" },
  { level: 5, name: "Maximum", description: "Very sensitive data" },
  { level: 6, name: "Ultra Secure", description: "Highly confidential" },
];

const ttlOptions = [
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Custom" },
];

export default function GrantAccessModal({ open, onOpenChange }: GrantAccessModalProps) {
  const [selectedPrivacyLevel, setSelectedPrivacyLevel] = useState(3);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GrantAccessForm>({
    resolver: zodResolver(grantAccessSchema),
    defaultValues: {
      requesterName: "",
      requesterEmail: "",
      dataRequested: "",
      purpose: "",
      privacyLevel: 3,
      ttl: "24h",
    },
  });

  const grantAccessMutation = useMutation({
    mutationFn: (data: Omit<GrantAccessForm, "ttl">) => 
      apiRequest("POST", "/api/grant-access", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Access Granted",
        description: "Access has been granted successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to grant access. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GrantAccessForm) => {
    const { ttl, ...requestData } = data;
    grantAccessMutation.mutate(requestData);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-grant-access">
        <DialogHeader>
          <DialogTitle>Grant Access</DialogTitle>
          <DialogDescription>
            Grant access to your data with specific privacy controls and time limits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requesterName">Requester</Label>
            <Input
              id="requesterName"
              placeholder="Organization or individual"
              {...form.register("requesterName")}
              data-testid="input-requester-name"
            />
            {form.formState.errors.requesterName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.requesterName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterEmail">Email</Label>
            <Input
              id="requesterEmail"
              type="email"
              placeholder="contact@organization.com"
              {...form.register("requesterEmail")}
              data-testid="input-requester-email"
            />
            {form.formState.errors.requesterEmail && (
              <p className="text-sm text-destructive">
                {form.formState.errors.requesterEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataRequested">Data Scope</Label>
            <Select 
              value={form.watch("dataRequested")} 
              onValueChange={(value) => form.setValue("dataRequested", value)}
            >
              <SelectTrigger data-testid="select-data-scope">
                <SelectValue placeholder="Select data scope" />
              </SelectTrigger>
              <SelectContent>
                {dataScopes.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.dataRequested && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dataRequested.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g., Account verification, Medical treatment"
              {...form.register("purpose")}
              data-testid="input-purpose"
            />
            {form.formState.errors.purpose && (
              <p className="text-sm text-destructive">
                {form.formState.errors.purpose.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Privacy Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {privacyLevels.slice(0, 6).map((level) => (
                <Button
                  key={level.level}
                  type="button"
                  variant={selectedPrivacyLevel === level.level ? "default" : "outline"}
                  className="p-3 h-auto flex-col"
                  onClick={() => {
                    setSelectedPrivacyLevel(level.level);
                    form.setValue("privacyLevel", level.level);
                  }}
                  data-testid={`button-privacy-level-${level.level}`}
                >
                  <div className="text-sm font-medium">Level {level.level}</div>
                  <div className="text-xs text-muted-foreground">{level.name}</div>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {privacyLevels.find(l => l.level === selectedPrivacyLevel)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ttl">Time to Live (TTL)</Label>
            <Select 
              value={form.watch("ttl")} 
              onValueChange={(value) => form.setValue("ttl", value)}
            >
              <SelectTrigger data-testid="select-ttl">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {ttlOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Sign with Lace Wallet</span>
              </div>
              <p className="mt-1">This action requires your digital signature to authorize access.</p>
            </AlertDescription>
          </Alert>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            data-testid="button-cancel-grant"
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={grantAccessMutation.isPending}
            data-testid="button-sign-and-grant"
          >
            {grantAccessMutation.isPending ? "Signing..." : "Sign & Grant Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
