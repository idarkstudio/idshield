import { Smartphone, Car, GraduationCap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplaceSection() {
  const marketplaceApps = [
    {
      name: "HealthCheck Pro",
      description: "Monitoreo de salud que solo accede a métricas básicas",
      icon: Smartphone,
      color: "teal",
      level: "Nivel 3 requerido",
      verified: true
    },
    {
      name: "AutoSecure",
      description: "Seguro de auto con verificación de historial mínima",
      icon: Car,
      color: "emerald",
      level: "Nivel 4 requerido",
      verified: true
    },
    {
      name: "EduVerify",
      description: "Verificación de credenciales académicas",
      icon: GraduationCap,
      color: "ocean",
      level: "Nivel 5 requerido",
      verified: true
    }
  ];

  return (
    <section id="marketplace" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-navy mb-4" data-testid="section-title-marketplace">
            Marketplace de Aplicaciones
          </h2>
          <p className="text-xl text-steel max-w-3xl mx-auto" data-testid="section-description-marketplace">
            Explora aplicaciones que respetan tu privacidad y solo acceden a los datos que necesitas compartir
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketplaceApps.map((app, index) => {
            const IconComponent = app.icon;
            return (
              <div 
                key={index} 
                className="bg-slate-bg rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
                data-testid={`marketplace-app-${index}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${app.color} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  {app.verified && (
                    <span className="px-3 py-1 bg-emerald/10 text-emerald-700 rounded-full text-sm" data-testid={`verified-badge-${index}`}>
                      Verificada
                    </span>
                  )}
                </div>
                
                <h4 className="font-semibold text-navy mb-2" data-testid={`app-name-${index}`}>
                  {app.name}
                </h4>
                <p className="text-steel text-sm mb-4" data-testid={`app-description-${index}`}>
                  {app.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-steel" data-testid={`app-level-${index}`}>
                    {app.level}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`text-${app.color} hover:text-${app.color}/80 transition-colors p-1`}
                    data-testid={`app-link-${index}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Abrir {app.name}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            className="bg-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-navy/90 transition-colors"
            data-testid="button-ver-todas-apps"
          >
            Ver Todas las Apps
          </Button>
        </div>
      </div>
    </section>
  );
}
