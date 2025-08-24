import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const { t } = useLanguage();

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Button 
          onClick={goBack}
          variant="ghost"
          className="mb-8 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('privacy.back') || (t('privacy.page.title').includes('Privacy') ? 'Back' : 'Volver')}
        </Button>

        <h1 className="text-4xl font-bold mb-8">
          {t('privacy.page.title')}
        </h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-8">
            {t('privacy.page.effective')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
              {t('privacy.page.tagline')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('privacy.page.intro')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.collect.title')}
            </h2>
            <ul className="text-slate-300 space-y-2">
              <li>• {t('privacy.page.collect.voluntary')}</li>
              <li>• {t('privacy.page.collect.usage')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.use.title')}
            </h2>
            <ul className="text-slate-300 space-y-2">
              <li>• {t('privacy.page.use.operate')}</li>
              <li>• {t('privacy.page.use.communicate')}</li>
              <li>• {t('privacy.page.use.compliance')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.not.title')}
            </h2>
            <ul className="text-slate-300 space-y-2">
              <li>• {t('privacy.page.not.sell')}</li>
              <li>• {t('privacy.page.not.share')}</li>
              <li>• {t('privacy.page.not.store')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.security.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('privacy.page.security.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.rights.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('privacy.page.rights.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.third.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('privacy.page.third.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('privacy.page.updates.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('privacy.page.updates.description')}
            </p>
          </section>

          <section className="mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-slate-300">
                {t('privacy.page.contact.info')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}