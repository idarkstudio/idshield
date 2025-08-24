import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@assets/horizontal_1755999944515.png";
import LanguageSelector from "@/components/LanguageSelector";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-700 z-50 transition-shadow duration-300 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img 
              src={logoImage} 
              alt="IDSHIELD LANDING Logo" 
              className="h-10 w-auto" 
              data-testid="logo-image" 
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavClick("#niveles")}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-1"
              data-testid="nav-niveles"
            >
              {t('nav.privacy.levels')}
            </button>
            <button 
              onClick={() => handleNavClick("#casos-uso")}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-1"
              data-testid="nav-casos-uso"
            >
              {t('nav.use.cases')}
            </button>
            <button 
              onClick={() => handleNavClick("#ace")}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-1"
              data-testid="nav-ace"
            >
              {t('nav.ace.framework')}
            </button>
            <a 
              href="https://github.com/idarkstudio/idshield" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-1"
              data-testid="nav-github"
            >
              {t('nav.github')}
            </a>
            <LanguageSelector />
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => handleNavClick("#demo")}
              className="bg-teal text-white hover:bg-teal/90 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
              data-testid="button-try-demo"
            >
              {t('nav.try.demo')}
            </Button>
            
            <button
              className="md:hidden text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => handleNavClick("#niveles")}
                className="text-slate-300 hover:text-white transition-colors text-left min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-2"
                data-testid="mobile-nav-niveles"
              >
                {t('nav.privacy.levels')}
              </button>
              <button 
                onClick={() => handleNavClick("#casos-uso")}
                className="text-slate-300 hover:text-white transition-colors text-left min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-2"
                data-testid="mobile-nav-casos-uso"
              >
                {t('nav.use.cases')}
              </button>
              <button 
                onClick={() => handleNavClick("#ace")}
                className="text-slate-300 hover:text-white transition-colors text-left min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-2"
                data-testid="mobile-nav-ace"
              >
                {t('nav.ace.framework')}
              </button>
              <a 
                href="https://github.com/idarkstudio/idshield" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors text-left min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded px-2 py-2 block"
                data-testid="mobile-nav-github"
              >
                {t('nav.github')}
              </a>
              <div className="px-2 py-2">
                <LanguageSelector />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
