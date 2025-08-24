import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ProfileWalletCard from "@/components/dashboard/profile-wallet-card";
import ShieldMeter from "@/components/dashboard/shield-meter";
import QuickActions from "@/components/dashboard/quick-actions";
import AccessRequestsTable from "@/components/dashboard/access-requests-table";
import RecentActivity from "@/components/dashboard/recent-activity";
import OnboardingModal from "@/components/onboarding-modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, VaultItem, AccessRequest, AuditLog } from "@shared/schema";

interface DashboardData {
  user: User;
  vaultItems: VaultItem[];
  accessRequests: AccessRequest[];
  auditLogs: AuditLog[];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequests = dashboardData?.accessRequests?.filter(req => req.status === "pending") || [];

  // Check if user needs onboarding (first-time user)
  const needsOnboarding = dashboardData?.user && (
    !dashboardData.user.fullName || 
    dashboardData.user.fullName.trim() === "" ||
    dashboardData.user.fullName === "John Doe" // Default demo name
  );

  // Check authentication on mount
  useEffect(() => {
    const session = localStorage.getItem('idshield_session');
    if (!session) {
      setLocation('/login');
    }
  }, [setLocation]);

  // Show onboarding modal for first-time users
  useEffect(() => {
    if (needsOnboarding && !isLoading) {
      setShowOnboarding(true);
    }
  }, [needsOnboarding, isLoading]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={dashboardData?.user} pendingRequestsCount={pendingRequests.length} />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : dashboardData ? (
            <>
              <ProfileWalletCard user={dashboardData.user} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShieldMeter 
                  user={dashboardData.user} 
                  vaultItems={dashboardData.vaultItems || []} 
                />
                <QuickActions />
              </div>
              
              <AccessRequestsTable accessRequests={dashboardData.accessRequests || []} />
              
              <RecentActivity auditLogs={dashboardData.auditLogs || []} />
            </>
          ) : null}
        </main>
      </div>

      {/* Onboarding Modal */}
      {dashboardData?.user && (
        <OnboardingModal
          open={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          user={dashboardData.user}
        />
      )}
    </div>
  );
}
