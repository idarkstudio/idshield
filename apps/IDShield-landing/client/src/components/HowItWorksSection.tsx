// HowItWorksMedical.tsx
import { useLanguage } from "@/contexts/LanguageContext";

export default function HowItWorksSection() {
  const { t } = useLanguage();
  return (
    <section id="how" className="py-20 bg-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        {/* Título */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {t('how.title')}
          </h2>
          <p className="mt-3 text-slate-300">
            {t('how.subtitle')}
          </p>
        </div>

        {/* 3 pasos principales */}
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {/* Paso 1 */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg mx-auto">1</div>
            <h3 className="mt-4 text-lg font-semibold text-white">{t('how.step.1.title')}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {t('how.step.1.description')}
            </p>
          </div>

          {/* Paso 2 */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg mx-auto">2</div>
            <h3 className="mt-4 text-lg font-semibold text-white">{t('how.step.2.title')}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {t('how.step.2.description')}
            </p>
          </div>

          {/* Paso 3 */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg mx-auto">3</div>
            <h3 className="mt-4 text-lg font-semibold text-white">{t('how.step.3.title')}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {t('how.step.3.description')}
            </p>
          </div>
        </div>

        {/* Ejemplo de uso: Flujo Paciente-Doctor */}
        <div className="mt-16">
          <h3 className="text-center text-2xl font-bold text-white mb-8">{t('how.example.title')}</h3>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <h4 className="text-base font-semibold text-white">{t('how.example.subtitle')}</h4>
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-slate-300">
                  {t('how.example.request')}
                </p>
                <p className="mt-1 text-xs text-slate-400">{t('how.example.request.scope')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  {t('how.example.auth')}
                </p>
                <p className="mt-1 text-xs text-slate-400">{t('how.example.auth.revoke')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  {t('how.example.record')}
                </p>
                <p className="mt-1 text-xs text-slate-400">{t('how.example.record.privacy')}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-white ring-1 ring-emerald-500/30">
{t('how.example.badge.1')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-white ring-1 ring-emerald-500/30">
{t('how.example.badge.2')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-white ring-1 ring-emerald-500/30">
{t('how.example.badge.3')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}