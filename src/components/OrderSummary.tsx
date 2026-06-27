import { Zap, Lock, Gem, CheckCircle, Loader2, Tag, Upload } from 'lucide-react';
import { useState } from 'react';
import { PromoCode, Game, GamePackage, PaymentMethod, Order } from '../types';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  const [receiptUrl, setReceiptUrl] = useState('');

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
    
    const code = promoCodes.find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
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

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setReceiptUrl(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
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
      receiptUrl: receiptUrl || undefined,
    };

    try {
      // Save order to firestore
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);

      const currentUserEmail = auth.currentUser?.email || 'N/A';
      
      try {
        await fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder, customerEmail: currentUserEmail }),
        });
      } catch (err) {
        console.warn('Failed to send email notification, but order was saved', err);
      }
      
      setIsProcessing(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onCheckoutSuccess(newOrder);
      }, 1500);

    } catch (error) {
      console.error('Error in checkout:', error);
      setPromoError('Hubo un error al procesar el pago.');
      setIsProcessing(false);
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
              className="w-full bg-surface border border-glass-border rounded-lg py-2 pl-9 pr-3 text-white focus:border-primary focus:outline-none uppercase text-sm"
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
          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none text-sm mb-4"
        />
        
        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Comprobante de Pago (Opcional)</label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            className="hidden"
            id="receipt-upload"
          />
          <label 
            htmlFor="receipt-upload"
            className="flex items-center justify-center gap-2 w-full bg-surface-elevated hover:bg-surface-container border-2 border-dashed border-glass-border hover:border-primary/50 transition-colors rounded-lg py-4 cursor-pointer text-sm text-on-surface-variant hover:text-primary group"
          >
            {receiptUrl ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={24} className="text-green-400" />
                <span className="text-green-400 font-medium">Comprobante Cargado</span>
              </div>
            ) : (
              <>
                <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                <span className="font-medium">Subir Capture / Imagen</span>
              </>
            )}
          </label>
          {receiptUrl && (
            <button 
              onClick={() => setReceiptUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs"
            >
              Quitar
            </button>
          )}
        </div>
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
  );
}
