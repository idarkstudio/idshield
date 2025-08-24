// PrivacyLevels.tsx
import { Shield, Eye, Lock, Users, Globe2, Activity } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";


export default function PrivacyLevelsSection() {
  const [active, setActive] = useState<number>(0);
  const { t } = useLanguage();
  const LEVELS = [
    {
      id: 0,
      title: t('privacy.level.0.title'),
      subtitle: t('privacy.level.0.subtitle'),
      icon: <Shield className="h-5 w-5 flex-shrink-0" />,
      color: "bg-slate-700 text-white border border-slate-500",
      access: t('privacy.level.0.access'),
      examples: t('privacy.level.0.examples'),
      security: t('privacy.level.0.security'),
      bullets: ["Nunca se comparte", "Fuente para pruebas ZK", "Claves/biometría/datos crudos"],
    },
    {
      id: 1,
      title: t('privacy.level.1.title'),
      subtitle: t('privacy.level.1.subtitle'),
      icon: <Eye className="h-5 w-5 flex-shrink-0" />,
      color: "bg-emerald-700 text-white border border-emerald-500",
      access: t('privacy.level.1.access'),
      examples: t('privacy.level.1.examples'),
      security: t('privacy.level.1.security'),
      bullets: ["Acceso puntual y granular", "Tiempo limitado (TTL)", "Alergias, pólizas, finanzas"],
    },
    {
      id: 2,
      title: t('privacy.level.2.title'),
      subtitle: t('privacy.level.2.subtitle'),
      icon: <Lock className="h-5 w-5 flex-shrink-0" />,
      color: "bg-emerald-600 text-white border border-emerald-400",
      access: t('privacy.level.2.access'),
      examples: t('privacy.level.2.examples'),
      security: t('privacy.level.2.security'),
      bullets: ["Permisos recurrentes", "Roles/ámbitos específicos", "Licencias, certificados"],
    },
    {
      id: 3,
      title: t('privacy.level.3.title'),
      subtitle: t('privacy.level.3.subtitle'),
      icon: <Users className="h-5 w-5 flex-shrink-0" />,
      color: "bg-sky-600 text-white border border-sky-400",
      access: t('privacy.level.3.access'),
      examples: t('privacy.level.3.examples'),
      security: t('privacy.level.3.security'),
      bullets: ["KYC mínimo (atributos anónimos)", "Acceso para dApps verificadas", "Perfil básico validado"],
    },
    {
      id: 4,
      title: t('privacy.level.4.title'),
      subtitle: t('privacy.level.4.subtitle'),
      icon: <Globe2 className="h-5 w-5 flex-shrink-0" />,
      color: "bg-orange-600 text-white border border-orange-400",
      access: t('privacy.level.4.access'),
      examples: t('privacy.level.4.examples'),
      security: t('privacy.level.4.security'),
      bullets: ["Perfiles públicos (Linkedin style)", "Historial de reputación", "Certificaciones y logros"],
    },
    {
      id: 5,
      title: t('privacy.level.5.title'),
      subtitle: t('privacy.level.5.subtitle'),
      icon: <Activity className="h-5 w-5 flex-shrink-0" />,
      color: "bg-indigo-600 text-white border border-indigo-400",
      access: t('privacy.level.5.access'),
      examples: t('privacy.level.5.examples'),
      security: t('privacy.level.5.security'),
      bullets: ["No vinculables a identidad", "Open data/estudios", "Políticas públicas"],
    },
    {
      id: 6,
      title: t('privacy.level.6.title'),
      subtitle: t('privacy.level.6.subtitle'),
      icon: <Globe2 className="h-5 w-5 flex-shrink-0" />,
      color: "bg-purple-600 text-white border border-purple-400",
      access: t('privacy.level.6.access'),
      examples: t('privacy.level.6.examples'),
      security: t('privacy.level.6.security'),
      bullets: ["Marketplace de aplicaciones", "APIs de terceros verificados", "Monetización de datos"],
    }
  ];
  const a = LEVELS.find(l => l.id === active)!;

  return (
    <section id="levels" className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t('privacy.title')}</h2>
          <p className="mt-3 text-slate-200">
            {t('privacy.subtitle')}
          </p>
        </div>

        {/* Mobile: carousel scroll-snap */}
        <div className="mt-10 md:hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
               style={{scrollbarWidth:"none"}} >
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setActive(l.id)}
                className="snap-start min-w-[80%] rounded-2xl border border-slate-600 bg-slate-800 p-5 text-left shadow-sm active:scale-[.99] transition"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs ${l.color}`}>
                  {l.icon}<span>{l.id}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{l.title}</h3>
                <p className="mt-1 text-sm text-slate-200">{l.subtitle}</p>
              </button>
            ))}
          </div>

          {/* Detail panel (mobile) */}
          <div className="mt-4 rounded-2xl border border-slate-600 bg-slate-800 p-5">
            <h4 className="text-base font-semibold text-white">{t('privacy.detail.prefix')} {a.id}</h4>
            
            <div className="mt-3 space-y-3">
              <div>
                <h5 className="text-sm font-semibold text-emerald-300 mb-1">{t('privacy.labels.access')}:</h5>
                <p className="text-xs text-slate-200">{a.access}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-emerald-300 mb-1">{t('privacy.labels.examples')}:</h5>
                <p className="text-xs text-slate-200">{a.examples}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-emerald-300 mb-1">{t('privacy.labels.security')}:</h5>
                <p className="text-xs text-slate-200">{a.security}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: grid layout */}
        <div className="mt-10 hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setActive(l.id)}
                className={`rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md
                           ${active===l.id ? "border-emerald-300 ring-2 ring-emerald-200 bg-slate-700" : "border-slate-600 bg-slate-800"}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs ${l.color}`}>
                    {l.icon}<span>{l.id}</span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    {l.icon}
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{l.title}</h3>
                <p className="mt-1 text-sm text-slate-200">{l.subtitle}</p>
              </button>
            ))}
          </div>
          
          {/* Desktop detail panel */}
          <div className="rounded-2xl border border-slate-600 bg-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${a.color}`}>
                {a.icon}<span className="font-semibold">Nivel {a.id}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{a.title}</h3>
                <p className="text-slate-200">{a.subtitle}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 mb-2 uppercase tracking-wider">{t('privacy.labels.access')}</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{a.access}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 mb-2 uppercase tracking-wider">{t('privacy.labels.examples')}</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{a.examples}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 mb-2 uppercase tracking-wider">{t('privacy.labels.security')}</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{a.security}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Hint */}
        <p className="mt-6 text-center text-xs text-slate-400">
          {t('privacy.explore.hint')}
        </p>
      </div>
    </section>
  );
}