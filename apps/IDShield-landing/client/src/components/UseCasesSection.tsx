import { Heart, Shield, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function UseCasesSection() {
  const { t } = useLanguage();
  
  const useCases = [
    {
      title: t('cases.health.title'),
      description: t('cases.health.description'),
      icon: Heart,
      color: "teal",
      compliance: t('cases.health.compliance'),
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      title: t('cases.insurance.title'),
      description: t('cases.insurance.description'),
      icon: Shield,
      color: "emerald",
      compliance: t('cases.insurance.verification'),
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      title: t('cases.government.title'),
      description: t('cases.government.description'),
      icon: Building,
      color: "ocean",
      compliance: t('cases.government.compliance'),
      image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    }
  ];

  return (
    <section id="casos-uso" className="py-20 bg-slate-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4" data-testid="section-title-casos-uso">
            {t('cases.title')}
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-testid="section-description-casos-uso">
            {t('cases.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
              <div 
                key={index} 
                className="bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-700"
                data-testid={`use-case-${index}`}
              >
                <img 
                  src={useCase.image}
                  alt={`Ilustración para ${useCase.title}`}
                  width="600" 
                  height="300"
                  loading="lazy"
                  className="rounded-lg mb-6 w-full h-48 object-cover"
                  data-testid={`use-case-image-${index}`}
                />
                
                <div className="mb-4">
                  <IconComponent className={`h-8 w-8 text-${useCase.color} mb-4`} />
                  <h3 className="text-2xl font-semibold text-white mb-3" data-testid={`use-case-title-${index}`}>
                    {useCase.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-4" data-testid={`use-case-description-${index}`}>
                    {useCase.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm text-${useCase.color} font-medium`} data-testid={`use-case-compliance-${index}`}>
                    {useCase.compliance}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`text-${useCase.color} hover:text-${useCase.color}/80 transition-colors p-0`}
                    data-testid={`use-case-button-${index}`}
                  >
                    <span className="sr-only">Más información sobre {useCase.title}</span>
                    →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
