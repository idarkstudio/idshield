import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3,
  Layers,
  Vault,
  Key,
  UserCheck,
  ClipboardList,
  Settings,
  Heart,
  Shield,
  CreditCard,
  Scan,
  User
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  // Get dashboard data to calculate pending requests and user type
  const { data: dashboardData } = useQuery<{ accessRequests: any[], user: any }>({
    queryKey: ["/api/dashboard"],
  });

  const pendingRequestsCount = dashboardData?.accessRequests?.filter(req => req.status === "pending").length || 0;
  const isPolice = dashboardData?.user?.userType === "police";

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: BarChart3, current: true },
    ...(isPolice ? [{ name: "Police Check", href: "/police-check", icon: Scan }] : []),
    { name: "Profile", href: "/profile", icon: User },
    { name: "Privacy Levels (0–6)", href: "/privacy-levels", icon: Layers },
    { 
      name: "My Vault", 
      icon: Vault, 
      children: [
        { name: "Health", href: "/vault/health", icon: Heart },
        { name: "Insurance", href: "/vault/insurance", icon: Shield },
        { name: "IDs", href: "/vault/ids", icon: CreditCard },
      ]
    },
    { name: "ZK Proofs", href: "/zk-proofs", icon: Key },
    { name: "Access Requests", href: "/access-requests", icon: UserCheck, badge: pendingRequestsCount },
    { name: "Audit Log", href: "/audit-log", icon: ClipboardList },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = item.href === location || (item.href === "/" && location === "/dashboard");
          
          if (item.children) {
            return (
              <div key={item.name} className="pt-2">
                <div className="flex items-center space-x-3 px-3 py-2 text-sidebar-foreground text-sm font-medium">
                  <item.icon className="h-5 w-5" />
                  <span data-testid={`nav-group-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.name}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => (
                    <a
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors",
                        "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                      )}
                      data-testid={`nav-link-${child.name.toLowerCase()}`}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              )}
              data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto"
                  data-testid={`badge-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.badge}
                </Badge>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
