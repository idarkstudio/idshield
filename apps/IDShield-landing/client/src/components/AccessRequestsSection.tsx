import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessRequestsSection() {
  const pendingRequests = [
    {
      app: "HealthApp",
      description: "Solicita acceso a edad y género para personalización",
      status: "pending"
    }
  ];

  const approvedRequests = [
    {
      app: "AutoSecure",
      description: "Acceso a historial de conducción - Nivel 3",
      status: "approved"
    }
  ];

  const revokedRequests = [
    {
      app: "DataMining Corp",
      description: "Acceso revocado por uso indebido",
      status: "revoked"
    }
  ];

  return (
    <section className="py-20 bg-slate-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-navy mb-4" data-testid="section-title-access-requests">
            Solicitudes de Acceso
          </h2>
          <p className="text-xl text-steel max-w-3xl mx-auto" data-testid="section-description-access-requests">
            Mantén el control total sobre quién accede a tu información y para qué propósito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-navy" data-testid="pending-requests-title">
                Pendientes
              </h3>
              <span className="px-3 py-1 bg-amber/10 text-amber-700 rounded-full text-sm" data-testid="pending-count">
                3 nuevas
              </span>
            </div>
            
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg" data-testid={`pending-request-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-navy" data-testid={`pending-app-${index}`}>
                      {request.app}
                    </span>
                    <span className="text-xs text-amber-600" data-testid={`pending-status-${index}`}>
                      Pendiente
                    </span>
                  </div>
                  <p className="text-sm text-steel mb-3" data-testid={`pending-description-${index}`}>
                    {request.description}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      className="flex-1 bg-emerald text-white hover:bg-emerald/90"
                      data-testid={`approve-button-${index}`}
                    >
                      Aprobar
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      data-testid={`reject-button-${index}`}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approved Requests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-navy" data-testid="approved-requests-title">
                Aprobadas
              </h3>
              <span className="px-3 py-1 bg-emerald/10 text-emerald-700 rounded-full text-sm" data-testid="approved-count">
                12 activas
              </span>
            </div>
            
            <div className="space-y-4">
              {approvedRequests.map((request, index) => (
                <div key={index} className="p-4 border border-emerald/20 bg-emerald/5 rounded-lg" data-testid={`approved-request-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-navy" data-testid={`approved-app-${index}`}>
                      {request.app}
                    </span>
                    <span className="text-xs text-emerald-600" data-testid={`approved-status-${index}`}>
                      Activa
                    </span>
                  </div>
                  <p className="text-sm text-steel mb-3" data-testid={`approved-description-${index}`}>
                    {request.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-emerald hover:text-emerald/80 p-0"
                    data-testid={`view-details-button-${index}`}
                  >
                    Ver detalles
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Revoked Requests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-navy" data-testid="revoked-requests-title">
                Revocadas
              </h3>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm" data-testid="revoked-count">
                2 recientes
              </span>
            </div>
            
            <div className="space-y-4">
              {revokedRequests.map((request, index) => (
                <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg" data-testid={`revoked-request-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-navy" data-testid={`revoked-app-${index}`}>
                      {request.app}
                    </span>
                    <span className="text-xs text-red-600" data-testid={`revoked-status-${index}`}>
                      Revocada
                    </span>
                  </div>
                  <p className="text-sm text-steel mb-3" data-testid={`revoked-description-${index}`}>
                    {request.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 p-0"
                    data-testid={`view-reason-button-${index}`}
                  >
                    Ver razón
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
