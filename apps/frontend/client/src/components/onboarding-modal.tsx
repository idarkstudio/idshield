import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Shield, 
  UserCheck,
  Sparkles
} from "lucide-react";

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20, "Phone too long").optional().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio too long").optional().or(z.literal("")),
  userType: z.enum(["citizen", "police"]).default("citizen"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  user: any;
}

export default function OnboardingModal({ open, onComplete, user }: OnboardingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
      userType: user?.userType || "citizen",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      // Get wallet connection info from localStorage if available
      const session = localStorage.getItem('idshield_session');
      let walletInfo = {};
      
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          walletInfo = {
            didAddress: sessionData.address,
            walletConnected: true,
            walletBalance: "0.00", // Default balance, could be updated by checking actual wallet
          };
        } catch (e) {
          console.warn('Failed to parse session data:', e);
        }
      }
      
      const profileData = { 
        ...data,
        ...walletInfo
      };
      
      const response = await apiRequest("PATCH", "/api/profile", profileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to IDShield!",
        description: "Your profile has been set up successfully.",
      });
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: OnboardingFormData) => {
    updateProfileMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Welcome to IDShield!</h3>
              <p className="text-muted-foreground">
                Let's set up your secure digital identity profile to get started with privacy-first data management.
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name *</span>
                </Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="Enter your full name"
                  data-testid="onboarding-input-fullname"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Account Type</span>
                </Label>
                <Select 
                  value={form.watch("userType")} 
                  onValueChange={(value) => form.setValue("userType", value as "citizen" | "police")}
                >
                  <SelectTrigger data-testid="onboarding-select-usertype">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Citizen</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="police">
                      <div className="flex items-center space-x-2">
                        <Badge className="h-4 w-4 text-blue-600" />
                        <span>Law Enforcement</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {form.watch("userType") === "police" 
                    ? "Access to police verification features and enhanced security tools" 
                    : "Standard privacy and identity management features"}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Contact Information</h3>
              <p className="text-muted-foreground">
                Add your contact details for secure communications and identity verification.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="your@email.com"
                  data-testid="onboarding-input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                  placeholder="+1 (555) 123-4567"
                  data-testid="onboarding-input-phone"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="City, Country"
                  data-testid="onboarding-input-location"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">About You</h3>
              <p className="text-muted-foreground">
                Tell us a bit about yourself to personalize your IDShield experience.
              </p>
            </div>

            <div className="space-y-4">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Bio (Optional)</span>
                </Label>
                <Textarea
                  id="bio"
                  {...form.register("bio")}
                  placeholder="Tell us about yourself, your interests, or how you plan to use IDShield..."
                  rows={4}
                  data-testid="onboarding-textarea-bio"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Optional but helps personalize your experience</span>
                  <span>{form.watch("bio")?.length || 0}/500</span>
                </div>
                {form.formState.errors.bio && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Your Privacy Matters</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  All your information is encrypted and stored securely. You have full control 
                  over what data you share and with whom. You can update or delete your profile 
                  information at any time.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            Complete Your Setup
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              data-testid="onboarding-button-previous"
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!form.watch("fullName") && currentStep === 1}
                data-testid="onboarding-button-next"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="onboarding-button-complete"
              >
                {updateProfileMutation.isPending ? "Setting up..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}