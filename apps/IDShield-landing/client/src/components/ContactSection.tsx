import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: ""
  });
  const [emailError, setEmailError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const waitlistMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('waitlist.success'),
        description: t('waitlist.success'),
      });
      setFormData({ name: "", email: "", interest: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: t('waitlist.error'),
        variant: "destructive",
      });
    },
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.interest) {
      toast({
        title: "Required fields",
        description: "Please complete all form fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    waitlistMutation.mutate(formData);
  };

  const benefits = [
    t('contact.benefits.1'),
    t('contact.benefits.2'),
    t('contact.benefits.3'),
    t('contact.benefits.4')
  ];

  return (
    <section id="contact" className="py-20 bg-navy">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4" data-testid="section-title-contact">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto" data-testid="section-description-contact">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-4" data-testid={`benefit-${index}`}>
                  <CheckCircle className="h-6 w-6 text-emerald flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" data-testid="label-name">
                  {t('contact.form.name')}
                </label>
                <Input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('contact.form.name')}
                  className="w-full min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
                  required
                  aria-describedby="name-error"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" data-testid="label-email">
                  {t('contact.form.email')}
                </label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="tu@email.com"
                  className={`w-full min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 ${
                    emailError ? "border-red-500" : ""
                  }`}
                  required
                  aria-describedby="email-error"
                  data-testid="input-email"
                />
                {emailError && (
                  <p id="email-error" className="text-red-600 text-sm mt-1" data-testid="email-error">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" data-testid="label-interest">
                  {t('contact.form.message')}
                </label>
                <Select value={formData.interest} onValueChange={(value) => setFormData(prev => ({ ...prev, interest: value }))}>
                  <SelectTrigger className="w-full min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2" data-testid="select-interest">
                    <SelectValue placeholder={t('contact.form.interest.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">{t('contact.form.interest.personal')}</SelectItem>
                    <SelectItem value="development">{t('contact.form.interest.development')}</SelectItem>
                    <SelectItem value="enterprise">{t('contact.form.interest.enterprise')}</SelectItem>
                    <SelectItem value="research">{t('contact.form.interest.research')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit"
                disabled={waitlistMutation.isPending || !!emailError}
                className="w-full bg-teal text-white py-3 rounded-lg font-semibold hover:bg-teal/90 transition-colors min-h-[48px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-submit-waitlist"
              >
                {waitlistMutation.isPending ? t('contact.form.loading') : t('contact.form.submit')}
              </Button>

              <p className="text-xs text-slate-400 text-center" data-testid="privacy-notice">
                {t('contact.form.privacy')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
