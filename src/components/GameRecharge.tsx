import { ArrowLeft } from 'lucide-react';
import { PromoCode, Game, GamePackage, PaymentMethod, Order } from '../types';
import Hero from './Hero';
import PlayerVerification from './PlayerVerification';
import PackageSelection from './PackageSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import OrderSummary from './OrderSummary';
import { useState } from 'react';

interface Props {
  game: Game;
  paymentMethods: PaymentMethod[];
  promoCodes: PromoCode[];
  onBack: () => void;
  onCheckoutSuccess: (order: Order) => void;
}

export default function GameRecharge({ game, paymentMethods, promoCodes, onBack, onCheckoutSuccess }: Props) {
  const [playerId, setPlayerId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(game.packages[1] || null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(paymentMethods[0].id);

  const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentId);

  return (
    <div className="w-full animation-fade-in pb-12 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-8 w-full flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          Volver a la tienda
        </button>
      </div>

      <Hero game={game} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-col gap-8">
          <PlayerVerification 
            playerId={playerId}
            setPlayerId={setPlayerId}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
          />
          
          <PackageSelection 
            packages={game.packages}
            selectedPackage={selectedPackage}
            onSelect={setSelectedPackage}
          />
          
          <PaymentMethodSelection 
            methods={paymentMethods}
            selectedId={selectedPaymentId}
            onSelect={setSelectedPaymentId}
          />
        </div>
        
        <div className="md:col-span-4 mt-8 md:mt-0">
          <OrderSummary 
            game={game}
            selectedPackage={selectedPackage}
            selectedPayment={selectedPayment}
            isVerified={isVerified}
            playerId={playerId}
            promoCodes={promoCodes}
            onCheckoutSuccess={onCheckoutSuccess}
          />
        </div>
      </div>
    </div>
  );
}
