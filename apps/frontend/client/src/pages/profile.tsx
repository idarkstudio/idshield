import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Shield
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20, "Phone too long").optional().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio too long").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<{ user: UserType; accessRequests: any[] }>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: dashboardData?.user?.fullName || "",
      email: dashboardData?.user?.email || "",
      phone: dashboardData?.user?.phone || "",
      location: dashboardData?.user?.location || "",
      bio: dashboardData?.user?.bio || "",
    },
  });

  // Reset form when data loads
  useState(() => {
    if (dashboardData?.user) {
      form.reset({
        fullName: dashboardData.user.fullName || "",
        email: dashboardData.user.email || "",
        phone: dashboardData.user.phone || "",
        location: dashboardData.user.location || "",
        bio: dashboardData.user.bio || "",
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const user = dashboardData?.user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} pendingRequestsCount={pendingRequests.length} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-48"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
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
              <h1 className="text-3xl font-bold" data-testid="title-profile">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your personal information and account preferences
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Privacy Level {user?.privacyLevel || 0}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1" data-testid="card-profile-overview">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.profilePicture || undefined} alt={user?.fullName || undefined} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl" data-testid="text-profile-name">
                  {user?.fullName || "Anonymous User"}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-mono" data-testid="text-profile-did">
                  {user?.didAddress}
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate" data-testid="text-profile-email">
                      {user?.email || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span data-testid="text-profile-phone">
                      {user?.phone || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span data-testid="text-profile-location">
                      {user?.location || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Edit Form */}
            <Card className="lg:col-span-2" data-testid="card-profile-edit">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit-profile"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-cancel-edit"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={form.handleSubmit(handleSave)}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      disabled={!isEditing}
                      data-testid="input-full-name"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      disabled={!isEditing}
                      data-testid="input-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-phone"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...form.register("location")}
                      disabled={!isEditing}
                      placeholder="City, Country"
                      data-testid="input-location"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      {...form.register("bio")}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                      placeholder="Tell us about yourself..."
                      data-testid="input-bio"
                    />
                    {form.formState.errors.bio && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.bio.message}
                      </p>
                    )}
                  </div>
                </form>

                {!isEditing && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Changes to your profile will be recorded in the audit log for security purposes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}