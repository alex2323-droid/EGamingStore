import { Banknote, CreditCard, Landmark, CheckCircle, Bitcoin } from 'lucide-react';
import { PaymentMethod } from '../types';

interface Props {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function PaymentMethodSelection({ methods, selectedId, onSelect }: Props) {
  const getIcon = (type: string, isActive: boolean) => {
    const className = `w-8 h-8 mb-2 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary/70'}`;
    switch (type) {
      case 'payments': return <Banknote className={className} />;
      case 'account_balance': return <Landmark className={className} />;
      case 'credit_card': return <CreditCard className={className} />;
      case 'binance': return <Bitcoin className={className} />;
      default: return <CreditCard className={className} />;
    }
  };

  return (
    <section className="glass-panel rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-sm font-semibold text-primary border border-glass-border">3</div>
        <h2 className="font-display text-lg font-semibold text-on-surface">Método de Pago</h2>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4">
        {(methods || []).map((method) => {
          const isSelected = selectedId === method.id;
          return (
            <div 
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`flex-shrink-0 w-32 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group relative ${
                isSelected 
                  ? 'bg-surface-dim border-2 border-primary' 
                  : 'bg-surface-dim border-2 border-glass-border hover:border-primary/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle size={16} className="text-primary" />
                </div>
              )}
              {getIcon(method.iconType, isSelected)}
              <span className="text-sm font-medium text-on-surface text-center px-2">{method.name}</span>
            </div>
          );
        })}
      </div>

      {(methods || []).find(m => m.id === selectedId)?.instructions && (
        <div className="mt-4 p-4 rounded-lg bg-surface-variant text-on-surface-variant text-sm space-y-1">
          <p className="font-semibold text-on-surface mb-2">Instrucciones de Pago:</p>
          <div className="whitespace-pre-wrap">{(methods || []).find(m => m.id === selectedId)?.instructions}</div>
        </div>
      )}
    </section>
  );
}
