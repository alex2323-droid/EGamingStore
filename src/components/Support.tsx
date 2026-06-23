import { MessageCircle, Mail, MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Support() {
  const faqs = [
    { q: '¿Cuánto tarda en reflejarse mi recarga?', a: 'La mayoría de nuestras recargas son instantáneas. Sin embargo, en algunos métodos de pago como Zelle, puede tomar hasta 15 minutos en verificarse.' },
    { q: '¿Qué hacer si me equivoqué de ID de jugador?', a: 'Comunícate inmediatamente con nuestro soporte a WhatsApp con tu número de orden. Si el saldo no ha sido procesado por el sistema automatizado, podremos cancelarlo.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos Pago Móvil, Zelle y tarjetas de crédito internacionales en un canal 100% seguro y encriptado.' },
    { q: '¿Cómo funciona el Bono Extra?', a: 'Algunos paquetes incluyen un bono marcado con una etiqueta roja. Este monto extra se acreditará junto con tu recarga principal y sin costo adicional.' }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">Centro de Soporte</h1>
        <p className="text-on-surface-variant font-medium mt-1">Estamos aquí para ayudarte. Contáctanos a través de nuestros canales oficiales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 border border-primary/30 shadow-[0_0_20px_rgba(238,119,8,0.05)] hover:border-primary/60 transition-colors cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
            <MessageCircle size={32} className="fill-current" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-on-surface">Atención Vía WhatsApp</h3>
            <p className="text-sm text-on-surface-variant mb-4 mt-2">Respuestas rápidas 24/7 a través de nuestro canal de WhatsApp para problemas urgentes y verificación de pagos.</p>
            <button className="bg-[#25D366] text-white font-bold py-2.5 px-6 rounded-lg w-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Chat en Vivo
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between gap-4 border border-glass-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-glass-border">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-display font-bold text-on-surface">Soporte por Correo</h4>
              <p className="text-sm font-medium text-on-surface-variant mt-1">soporte@egamingstore.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4 mt-2">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-glass-border">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-display font-bold text-on-surface">Ubicación</h4>
              <p className="text-sm font-medium text-on-surface-variant mt-1">Caracas, Venezuela<br/>Disponible mundialmente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-on-surface mb-6">Preguntas Frecuentes</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="glass-panel rounded-xl overflow-hidden border border-glass-border transition-colors cursor-pointer hover:border-primary/30"
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div className="p-4 flex items-center justify-between gap-4 bg-surface-container-low">
                  <h4 className="font-display font-bold text-sm md:text-base text-on-surface">{faq.q}</h4>
                  <ChevronDown className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
                </div>
                <div 
                  className={`px-4 text-on-surface-variant font-medium text-sm transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 pb-4 pt-2 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
