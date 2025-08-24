import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
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
        title: "¡Registrado exitosamente!",
        description: "Te hemos agregado a nuestra lista de espera para early access.",
      });
      setFormData({ name: "", email: "", interest: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu solicitud. Intenta nuevamente.",
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
      setEmailError("Por favor ingresa una dirección de email válida");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.interest) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos del formulario.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa una dirección de email válida.",
        variant: "destructive",
      });
      return;
    }

    waitlistMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Únete a la Lista de Espera</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            data-testid="close-modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-slate-300 mb-6">
          Sé de los primeros en acceder a IDShield y experimenta el futuro de la privacidad digital.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre completo *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tu nombre completo"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              data-testid="input-name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="tu@email.com"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              data-testid="input-email"
            />
            {emailError && (
              <p className="text-red-400 text-sm mt-1" data-testid="email-error">
                {emailError}
              </p>
            )}
          </div>

          {/* Interest Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ¿Qué te interesa más? *
            </label>
            <Select value={formData.interest} onValueChange={(value) => setFormData(prev => ({ ...prev, interest: value }))}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="select-interest">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="privacy" className="text-white hover:bg-slate-700">Control de privacidad</SelectItem>
                <SelectItem value="blockchain" className="text-white hover:bg-slate-700">Integración blockchain</SelectItem>
                <SelectItem value="marketplace" className="text-white hover:bg-slate-700">Marketplace de apps</SelectItem>
                <SelectItem value="developer" className="text-white hover:bg-slate-700">Herramientas para desarrolladores</SelectItem>
                <SelectItem value="business" className="text-white hover:bg-slate-700">Soluciones empresariales</SelectItem>
                <SelectItem value="other" className="text-white hover:bg-slate-700">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Benefits */}
          <div className="bg-slate-800/50 rounded-lg p-4 mt-6">
            <h3 className="text-emerald-400 font-semibold mb-3">Lo que obtienes:</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Acceso temprano a IDShield</li>
              <li>• Notificaciones sobre nuevas funciones</li>
              <li>• Descuentos especiales</li>
              <li>• Invitaciones a eventos exclusivos</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={waitlistMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 mt-6"
            data-testid="button-submit"
          >
            {waitlistMutation.isPending ? "Enviando..." : "Unirse a la Lista"}
          </Button>

          <p className="text-xs text-slate-400 text-center mt-4" data-testid="privacy-notice">
            Al registrarte, aceptas nuestros términos de privacidad. No spam, prometido.
          </p>
        </form>
      </div>
    </div>
  );
}