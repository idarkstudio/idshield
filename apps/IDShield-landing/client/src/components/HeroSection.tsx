import React, { useState } from "react";
import MatrixTunnel from "./MatrixTunnel";
import WaitlistModal from "./WaitlistModal";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@assets/logo+nombre_1756000028088.png";

export default function HeroSection() {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0b1220 0%, #0e1528 100%)",
      }}
    >
      <MatrixTunnel />
      <div className="absolute inset-0 bg-slate-900/70" style={{ zIndex: 2 }} />
      <div className="relative mx-auto w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center" style={{ zIndex: 3 }}>
        {/* Left */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-white ring-1 ring-emerald-400/30">
            {t('hero.hackathon.participating')} <strong><a href="https://lu.ma/4uq8yejo?tk=zxwwek" target="_blank" rel="noopener noreferrer" className="hover:underline">{t('hero.hackathon.link')}</a></strong>
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-white">
            {t('hero.title')} <span className="text-emerald-400">{t('hero.title.highlight')}</span> {t('hero.title.end')}
          </h1>
          <p className="mt-4 text-slate-300">
            {t('hero.subtitle')}
          </p>

          <ul className="mt-5 space-y-2 text-slate-400 text-sm">
            <li>{t('hero.feature.1')}</li>
            <li>{t('hero.feature.2')}</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://dapp.idshield.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ring-2 ring-emerald-400/20 hover:ring-emerald-400/40">
              {t('hero.cta.demo')}
            </a>
            <button 
              onClick={() => setIsWaitlistModalOpen(true)}
              className="px-5 py-3 rounded-xl border border-emerald-400 text-white hover:bg-emerald-400/10 font-semibold transition-colors"
              data-testid="button-waitlist"
            >
              {t('hero.cta.waitlist')}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="md:justify-self-end">
          <img
            src={logoImage}
            alt="IDShield - Escudo de privacidad con logo y nombre"
            className="w-[500px] max-w-full mx-auto block"
          />
        </div>
      </div>
      
      <WaitlistModal 
        isOpen={isWaitlistModalOpen} 
        onClose={() => setIsWaitlistModalOpen(false)} 
      />
    </section>
  );
}