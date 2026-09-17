import { CheckCircle2, Info, User, Mail, Gift, Radio } from 'lucide-react';
import { useEffect } from 'react';
import { GamePackage, Game, isGameGiftCard, isGameService } from '../types';

interface Props {
  playerId: string;
  setPlayerId: (id: string) => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  selectedPackage?: GamePackage | null;
  game?: Game;
}

export default function PlayerVerification({ playerId, setPlayerId, isVerified, setIsVerified, game }: Props) {
  const isGift = isGameGiftCard(game);
  const isService = isGameService(game);

  // Cuando el usuario ingresa su ID / contacto con al menos 3 caracteres, se considera listo para continuar
  useEffect(() => {
    if (playerId && playerId.trim().length >= 3) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, [playerId, setIsVerified]);

  return (
    <section className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-cyan-500/20 bg-surface/90 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm font-black text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.3)]">
            {isGift ? <Gift size={16} /> : isService ? <Radio size={16} /> : 2}
          </div>
          <h2 className="font-display text-lg font-bold text-on-surface">
            {isGift 
              ? `Datos de Entrega (${game?.name || 'Gift Card'})` 
              : isService 
              ? `ID / Usuario del Servicio (${game?.name || 'Servicio'})`
              : `ID de Jugador (${game?.name || 'Juego'})`}
          </h2>
        </div>
        {playerId.trim().length >= 3 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-in fade-in">
            <CheckCircle2 size={14} /> {isGift ? 'Listo para entrega' : 'ID Listo'}
          </span>
        )}
      </div>

      <div className="relative">
        {isGift ? (
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70" size={20} />
        ) : isService ? (
          <Radio className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70" size={20} />
        ) : (
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70" size={20} />
        )}
        <input 
          type="text" 
          value={playerId}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= 60) {
              setPlayerId(val);
            }
          }}
          placeholder={
            isGift 
              ? "Ingresa tu Correo o WhatsApp donde recibirás el código" 
              : isService
              ? "Ingresa tu ID de cuenta o @usuario (ej: ID de app o @usuario)"
              : "Ingresa tu ID de jugador (ej: 123456789)"
          } 
          maxLength={60}
          className="w-full bg-surface-container-low border border-cyan-500/30 rounded-xl py-3.5 pl-11 pr-4 text-on-surface font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all placeholder:text-on-surface-variant/60 shadow-inner"
        />
      </div>

      <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5">
        <Info size={14} className="text-cyan-400 shrink-0" />
        {isGift 
          ? "El código o PIN digital de la tarjeta se enviará directamente a este contacto tras verificar el pago."
          : isService
          ? "Introduce tu ID o usuario de la plataforma exactamente como aparece en tu perfil para acreditar tus monedas/estrellas."
          : "Introduce tu ID exactamente como aparece en tu perfil del juego para garantizar la entrega inmediata."}
      </p>
    </section>
  );
}
