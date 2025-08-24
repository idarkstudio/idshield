import { Github, Twitter, MessageCircle, Send } from "lucide-react";
import logoImage from "@assets/horizontal_1755999944515.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const productLinks = [
    { name: t('footer.features'), href: "#", action: "contact" },
    { name: t('footer.security'), href: "#", action: "contact" },
    { name: t('footer.integration'), href: "#", action: "coming-soon" },
    { name: t('footer.api'), href: "#", action: "coming-soon" }
  ];

  const supportLinks = [
    { name: t('footer.documentation'), href: "https://docs.idshield.cc/", action: "external" },
    { name: t('footer.help'), href: "https://docs.idshield.cc/", action: "external" },
    { name: t('footer.contact'), href: "#contact", action: "scroll" },
    { name: t('footer.status'), href: "#", action: "contact" }
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/idarkstudio/idshield", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: MessageCircle, href: "#", label: "Discord" },
    { icon: Send, href: "#", label: "Telegram" }
  ];

  const legalLinks = [
    { name: t('footer.privacy'), href: "/privacy", action: "navigate" },
    { name: t('footer.terms'), href: "/terms", action: "navigate" }
  ];

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    e.preventDefault();
    if (link.action === "coming-soon") {
      setShowComingSoon(true);
    } else if (link.action === "scroll") {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (link.action === "navigate") {
      window.location.href = link.href;
    } else if (link.action === "external") {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else if (link.action === "contact") {
      const element = document.querySelector("#contact");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={logoImage} 
                alt="IDSHIELD LANDING Logo" 
                className="h-12 w-auto" 
                data-testid="footer-logo" 
              />
            </div>
            <p className="text-slate-400 mb-6 max-w-md" data-testid="footer-description">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a 
                    key={index}
                    href={social.href}
                    className="text-slate-400 hover:text-teal transition-colors"
                    aria-label={social.label}
                    data-testid={`social-link-${social.label.toLowerCase()}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4" data-testid="footer-product-title">
              {t('footer.product')}
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={(e) => handleLinkClick(e, link)}
                    className="hover:text-teal transition-colors text-left"
                    data-testid={`product-link-${index}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4" data-testid="footer-support-title">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={(e) => handleLinkClick(e, link)}
                    className="hover:text-teal transition-colors text-left"
                    data-testid={`support-link-${index}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm" data-testid="footer-copyright">
                {t('footer.copyright')} <a href="https://insidedarkstudio.com" target="_blank" rel="noopener noreferrer" className="text-teal hover:text-teal/80 transition-colors" data-testid="inside-dark-studio-link">Inside Dark Studio</a>{t('footer.rights')}
              </p>
              <p className="text-slate-500 text-xs mt-1" data-testid="footer-hackathon">
                {t('footer.hackathon')}
              </p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {legalLinks.map((link, index) => (
                <button 
                  key={index}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="text-slate-400 hover:text-teal transition-colors text-sm"
                  data-testid={`legal-link-${index}`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowComingSoon(false)}>
          <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{t('footer.coming.soon')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComingSoon(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-300 mb-6">
              {t('footer.coming.soon') === 'Coming Soon' 
                ? 'This feature is coming soon. Stay tuned for updates!' 
                : 'Esta característica estará disponible próximamente. ¡Manténte atento a las actualizaciones!'}
            </p>
            <Button 
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {t('footer.coming.soon') === 'Coming Soon' ? 'Close' : 'Cerrar'}
            </Button>
          </div>
        </div>
      )}
    </footer>
  );
}
