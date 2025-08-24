// ACESection.tsx – sección "Framework ACE" con cobertura de hackathon
import { Check, Info, Shield, Users, Handshake, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ACESection() {
  const { t } = useLanguage();
  return (
    <section id="ace" aria-labelledby="ace-title" className="relative py-20 bg-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 id="ace-title" className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {t('ace.title')} <span className="text-teal">{t('ace.title.highlight')}</span> {t('ace.title.end')}
          </h2>
          <p className="mt-3 text-slate-300">
            {t('ace.subtitle')} <b>{t('ace.subtitle.challenge')}</b> {t('ace.subtitle.hackathon')}{" "}
            <b>Association</b>, <b>Commerce</b> y <b>Expression</b> {t('ace.subtitle.components')}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {/* Association */}
          <div className="group rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Users className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-white">{t('ace.association.title')}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {t('ace.association.description')}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Info className="h-4 w-4" aria-hidden="true" />
              <span>{t('ace.association.example')}</span>
            </div>
          </div>

          {/* Commerce */}
          <div className="group rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <Handshake className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-white">{t('ace.commerce.title')}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {t('ace.commerce.description')} <b>{t('ace.commerce.description.highlight')}</b> {t('ace.commerce.description.end')}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Info className="h-4 w-4" aria-hidden="true" />
              <span>{t('ace.commerce.example')}</span>
            </div>
          </div>

          {/* Expression */}
          <div className="group rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-white">{t('ace.expression.title')}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {t('ace.expression.description')}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Info className="h-4 w-4" aria-hidden="true" />
              <span>{t('ace.expression.example')}</span>
            </div>
          </div>
        </div>

        {/* Coverage strip (explicit hackathon compliance) */}
        <div className="mt-10 rounded-2xl border border-teal/30 bg-teal/10 p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-teal" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">{t('ace.coverage.title')}</p>
              <p className="mt-1 text-sm text-slate-200">
                {t('ace.coverage.description')} <b>{t('ace.coverage.tracks')}</b> y usamos <b>{t('ace.coverage.components')}</b>{t('ace.coverage.description.end')}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span><b>{t('ace.zk.verification')}</b> {t('ace.zk.description')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span><b>{t('ace.secure.sharing')}</b> {t('ace.secure.description')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span><b>{t('ace.openzeppelin.integration')}</b> {t('ace.openzeppelin.description')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span><b>{t('ace.developer.tooling')}</b> {t('ace.developer.description')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <a href="#demo" className="inline-flex items-center gap-2 rounded-2xl bg-teal px-5 py-3 text-white font-semibold hover:bg-teal/90 transition-colors">
            {t('ace.cta.demo')}
          </a>
          <p className="text-xs text-slate-300">{t('ace.demo.description')}</p>
        </div>
      </div>
    </section>
  );
}