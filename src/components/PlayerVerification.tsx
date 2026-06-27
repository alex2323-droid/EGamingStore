import { CheckCircle, Info, User } from 'lucide-react';
import { useState } from 'react';

interface Props {
  playerId: string;
  setPlayerId: (id: string) => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
}

export default function PlayerVerification({ playerId, setPlayerId, isVerified, setIsVerified }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    if (!playerId) return;
    setIsLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerified(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-sm font-semibold text-primary border border-glass-border">1</div>
        <h2 className="font-display text-lg font-semibold text-on-surface">ID de Jugador</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            value={playerId}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 15) {
                setPlayerId(val);
                setIsVerified(false);
              }
            }}
            placeholder="Ingresa tu UID de jugador (Max 15 dígitos)" 
            maxLength={15}
            className="w-full bg-surface-dim border border-glass-border rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant"
          />
        </div>
        <button 
          onClick={handleVerify}
          disabled={!playerId || isLoading || isVerified}
          className={`
            font-semibold py-3 px-6 rounded-lg transition-colors border flex items-center justify-center gap-2 whitespace-nowrap
            ${isVerified 
              ? 'bg-green-500/20 text-green-400 border-green-500/50 cursor-default' 
              : 'bg-surface-variant hover:bg-surface-bright text-on-surface border-glass-border'
            }
            ${(!playerId || isLoading) && !isVerified ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <span className="animate-pulse">Verificando...</span>
          ) : isVerified ? (
            <>Verificado <CheckCircle size={18} /></>
          ) : (
            <>Verificar <CheckCircle size={18} /></>
          )}
        </button>
      </div>

      <p className="text-sm text-on-surface-variant mt-3 flex items-center gap-1.5">
        <Info size={14} /> Puedes encontrar tu UID en tu perfil del juego.
      </p>
    </section>
  );
}
