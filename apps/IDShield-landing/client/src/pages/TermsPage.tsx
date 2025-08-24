import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          {t('terms.back') || (t('terms.page.title').includes('Terms') ? 'Back' : 'Volver')}
        </Button>

        <h1 className="text-4xl font-bold mb-8">
          {t('terms.page.title')}
        </h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-8">
            {t('terms.page.effective')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.acceptance.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.acceptance.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.purpose.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.purpose.intro')}
            </p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li>• {t('terms.page.purpose.info')}</li>
              <li>• {t('terms.page.purpose.demo')}</li>
              <li>• {t('terms.page.purpose.waitlist')}</li>
            </ul>
            <p className="text-slate-300 mb-4">
              {t('terms.page.purpose.disclaimer')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.eligibility.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.eligibility.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.responsibilities.title')}
            </h2>
            <ul className="text-slate-300 space-y-2">
              <li>• {t('terms.page.responsibilities.lawful')}</li>
              <li>• {t('terms.page.responsibilities.hack')}</li>
              <li>• {t('terms.page.responsibilities.info')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.intellectual.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.intellectual.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.thirdparty.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.thirdparty.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.warranties.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.warranties.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.liability.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.liability.intro')}
            </p>
            <ul className="text-slate-300 space-y-2">
              <li>• {t('terms.page.liability.damages')}</li>
              <li>• {t('terms.page.liability.data')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.changes.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.changes.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t('terms.page.governing.title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('terms.page.governing.description')}
            </p>
          </section>

          <section className="mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                {t('terms.page.contact.title')}
              </h2>
              <p className="text-slate-300">
                {t('terms.page.contact.description')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}