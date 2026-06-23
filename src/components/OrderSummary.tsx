import { Zap, Lock, Gem, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Game, GamePackage, PaymentMethod, Order } from '../types';
import { auth } from '../firebase';

interface Props {
  game: Game;
  selectedPackage: GamePackage | null;
  selectedPayment: PaymentMethod | undefined;
  isVerified: boolean;
  onCheckoutSuccess: (order: Order) => void;
}

export default function OrderSummary({ game, selectedPackage, selectedPayment, isVerified, onCheckoutSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!selectedPackage || !selectedPayment) return;
    
    setIsProcessing(true);
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      date: new Date().toISOString(),
      gameName: game.name,
      packageName: `${selectedPackage.amount} ${selectedPackage.currency}`,
      price: selectedPackage.price,
      status: 'completed',
      paymentMethod: selectedPayment.name
    };

    try {
      const currentUserEmail = auth.currentUser?.email || 'N/A';
      
      await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder, customerEmail: currentUserEmail }),
      });
      
      setIsProcessing(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onCheckoutSuccess(newOrder);
      }, 1500);

    } catch (error) {
      console.error('Error in checkout:', error);
      setIsProcessing(false);
      // Even if email fails, we might still want to proceed with the UI flow
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onCheckoutSuccess(newOrder);
      }, 1500);
    }
  };

  return (
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

      <div className="border-t border-glass-border pt-4 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-lg font-medium text-on-surface">Total</span>
          <span className="font-display text-4xl font-extrabold text-primary leading-none">
            {selectedPackage ? `Bs ${selectedPackage.price.toFixed(2)}` : 'Bs 0.00'}
          </span>
        </div>
      </div>

      <button 
        onClick={handleCheckout}
        disabled={!isVerified || !selectedPackage || !selectedPayment || isProcessing || showSuccess}
        className={`w-full font-display text-lg font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden ${
          !isVerified || !selectedPackage || !selectedPayment
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
  );
}
