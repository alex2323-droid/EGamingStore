import { Zap, Lock, Gem, CheckCircle, Loader2, Tag, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { PromoCode, Game, GamePackage, PaymentMethod, Order } from '../types';
import { auth, db } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  game: Game;
  selectedPackage: GamePackage | null;
  selectedPayment: PaymentMethod | undefined;
  isVerified: boolean;
  playerId?: string;
  promoCodes?: PromoCode[];
  onCheckoutSuccess: (order: Order) => void;
}

export default function OrderSummary({ game, selectedPackage, selectedPayment, isVerified, playerId, promoCodes = [], onCheckoutSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Confetti trigger function
  const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    let price = selectedPackage.price;
    
    // 1. Package Discount
    if (selectedPackage.discountPercentage) {
      price = price * (1 - (selectedPackage.discountPercentage / 100));
    }
    
    // 2. Promo Code Discount
    if (appliedPromo) {
      price = price * (1 - (appliedPromo.discountPercentage / 100));
    }
    
    return price;
  };

  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoCodeInput.trim()) {
      setAppliedPromo(null);
      return;
    }
    
    const code = (promoCodes || []).find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (code) {
      if (code.active) {
        setAppliedPromo(code);
      } else {
        setPromoError('Este código ya no es válido.');
        setAppliedPromo(null);
      }
    } else {
      setPromoError('Código de descuento inválido.');
      setAppliedPromo(null);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPackage || !selectedPayment || !referenceNumber.trim()) return;
    
    setIsProcessing(true);
    
    const finalPrice = calculateFinalPrice();
    const currentUserEmail = auth.currentUser?.email || 'N/A';
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      date: new Date().toISOString(),
      gameName: game.name,
      packageName: `${selectedPackage.amount} ${selectedPackage.currency}`,
      price: finalPrice,
      status: 'pending',
      paymentMethod: selectedPayment.name,
      referenceNumber: referenceNumber.trim(),
      userId: auth.currentUser?.uid || 'N/A',
      userEmail: currentUserEmail,
      playerId: playerId || 'N/A',
    };

    try {
      // Save order to firestore
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);

      const currentUserEmail = auth.currentUser?.email || 'N/A';
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      // Ejecutamos la llamada al servidor de correo en segundo plano para no bloquear el UI
      fetch(`${apiUrl}/api/notify-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder, customerEmail: currentUserEmail }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Email server error:', errorData);
          try {
            await addDoc(collection(db, 'email_errors'), {
              type: 'notify-order',
              orderId: newOrder.id,
              customerEmail: currentUserEmail,
              error: errorData,
              status: response.status,
              timestamp: new Date().toISOString()
            });
          } catch (logErr) {
            console.error('Failed to log email error to Firestore', logErr);
          }
        }
      }).catch(async (err) => {
        console.warn('Failed to send email notification, but order was saved', err);
        try {
          await addDoc(collection(db, 'email_errors'), {
            type: 'notify-order',
            orderId: newOrder.id,
            customerEmail: currentUserEmail,
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString()
          });
        } catch (logErr) {
          console.error('Failed to log email error to Firestore', logErr);
        }
      });
      
      setIsProcessing(false);
      setShowSuccess(true);
      triggerConfetti();
      
      setTimeout(() => {
        setShowSuccess(false);
        onCheckoutSuccess(newOrder);
      }, 3500);

    } catch (error) {
      console.error('Error in checkout:', error);
      setPromoError('Hubo un error al procesar el pago.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="glass-panel rounded-xl p-6 sticky top-24 border-t-4 border-t-primary">
        <h3 className="font-display text-xl font-bold text-on-surface mb-6 border-b border-glass-border pb-4">Resumen de Compra</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Juego</span>
            <span className="font-semibold text-on-surface">{game.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Paquete</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              {selectedPackage ? `${selectedPackage.amount} ${selectedPackage.currency}` : '--'}
              {selectedPackage && <Gem size={16} className="text-tertiary-container" />}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Método</span>
            <span className="font-semibold text-on-surface">
              {selectedPayment ? selectedPayment.name : '--'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-glass-border py-4 mb-4">
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Código de Descuento</label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                placeholder="Ej: EMBAJADOR10"
                className="w-full bg-surface border border-glass-border rounded-lg py-2 pl-9 pr-3 text-on-surface focus:border-primary focus:outline-none uppercase text-sm"
              />
            </div>
            <button 
              onClick={handleApplyPromo}
              disabled={!promoCodeInput.trim()}
              className="bg-surface-elevated hover:bg-primary/20 text-primary font-bold px-4 rounded-lg text-sm transition-colors border border-glass-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar
            </button>
          </div>
          {promoError && <p className="text-red-400 text-xs mt-2 font-medium">{promoError}</p>}
          {appliedPromo && <p className="text-green-400 text-xs mt-2 font-medium">¡Código {appliedPromo.code} aplicado! (-{appliedPromo.discountPercentage}%)</p>}
        </div>

        <div className="border-t border-glass-border pt-4 mb-4">
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Número de Referencia de Pago</label>
          <input 
            type="text" 
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Ej: 12345678"
            className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none text-sm mb-4"
          />
        </div>

        <div className="border-t border-glass-border pt-4 mb-6">
          <div className="flex flex-col gap-1">
            {selectedPackage && (selectedPackage.discountPercentage || appliedPromo) && (
              <div className="flex justify-between items-center text-sm text-on-surface-variant line-through">
                <span>Precio Original</span>
                <span>Bs {selectedPackage.price.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-end mt-2">
              <span className="text-lg font-medium text-on-surface">Total</span>
              <span className="font-display text-4xl font-extrabold text-primary leading-none">
                {selectedPackage ? `Bs ${calculateFinalPrice().toFixed(2)}` : 'Bs 0.00'}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={!isVerified || !selectedPackage || !selectedPayment || !referenceNumber.trim() || isProcessing || showSuccess}
          className={`w-full font-display text-lg font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden ${
            !isVerified || !selectedPackage || !selectedPayment || !referenceNumber.trim()
              ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              : showSuccess
              ? 'bg-green-500 text-white shadow-lg'
              : 'btn-primary btn-primary-hover text-white shadow-lg'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Procesando Pago...
            </>
          ) : showSuccess ? (
            <>
              <CheckCircle size={20} />
              ¡Pago Exitoso!
            </>
          ) : (
            <>
              <Zap size={20} />
              Realizar Pago
            </>
          )}
        </button>
        
        <p className="text-xs font-medium text-on-surface-variant text-center mt-4 flex items-center justify-center gap-1.5">
          <Lock size={14} /> Transacción Segura 100%
        </p>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-surface border border-glass-border shadow-2xl rounded-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PartyPopper size={40} className="text-green-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-on-surface mb-2">
                ¡Orden Recibida!
              </h2>
              <p className="text-on-surface-variant mb-6">
                Tu recarga está siendo procesada. Serás redirigido a tus órdenes...
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.5, ease: "linear" }}
                className="h-1 bg-green-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
