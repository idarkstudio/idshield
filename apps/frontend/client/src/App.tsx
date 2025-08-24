import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import PoliceCheck from "@/pages/police-check";
import Profile from "@/pages/profile";
import AccessRequests from "@/pages/access-requests";
import AuditLog from "@/pages/audit-log";
import Settings from "@/pages/settings";
import PrivacyLevels from "@/pages/privacy-levels";
import HealthVault from "@/pages/vault/health";
import InsuranceVault from "@/pages/vault/insurance";
import IDsVault from "@/pages/vault/ids";
import ZKProofs from "@/pages/zk-proofs";
import Login from "@/pages/login";
import MedicalForm from "@/pages/medical-form";
import VerifyProof from "@/pages/verify-proof";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/police-check" component={PoliceCheck} />
      <Route path="/profile" component={Profile} />
      <Route path="/access-requests" component={AccessRequests} />
      <Route path="/audit-log" component={AuditLog} />
      <Route path="/settings" component={Settings} />
      <Route path="/privacy-levels" component={PrivacyLevels} />
      <Route path="/vault/health" component={HealthVault} />
      <Route path="/vault/insurance" component={InsuranceVault} />
      <Route path="/vault/ids" component={IDsVault} />
      <Route path="/zk-proofs" component={ZKProofs} />
      <Route path="/medical-form/:token" component={MedicalForm} />
      <Route path="/verify-proof/:id" component={VerifyProof} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
