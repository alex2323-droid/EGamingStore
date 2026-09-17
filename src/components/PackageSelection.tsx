import { useState, useMemo } from 'react';
import { Info, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { GamePackage } from '../types';
import { PackageIcon } from './PackageIcons';

interface Props {
  packages: GamePackage[];
  selectedPackage: GamePackage | null;
  onSelect: (pkg: GamePackage) => void;
  exchangeRate?: number;
  gameCurrency?: string;
  gameName?: string;
}

export default function PackageSelection({
  packages = [],
  selectedPackage,
  onSelect,
  exchangeRate = 1,
  gameCurrency = '',
  gameName = 'Juego'
}: Props) {
  const [showInfoModal, setShowInfoModal] = useState<GamePackage | null>(null);
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(false);

  // Group packages by category if available, or automatically by type (Currency vs Paquetes/Pases)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    packages.forEach(p => {
      if (p.category) {
        cats.add(p.category);
      } else if (p.title) {
        cats.add('Paquetes');
      } else {
        cats.add(p.currency || gameCurrency || 'Monedas');
      }
    });
    return Array.from(cats);
  }, [packages, gameCurrency]);

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (categories.length > 0) return categories[0];
    return 'Todos';
  });

  // Filter packages based on active category
  const filteredPackages = useMemo(() => {
    if (categories.length <= 1) return packages;
    return packages.filter(p => {
      const cat = p.category || (p.title ? 'Paquetes' : (p.currency || gameCurrency || 'Monedas'));
      return cat === activeCategory;
    });
  }, [packages, activeCategory, categories, gameCurrency]);

  const formatBs = (amount: number) => {
    return `Bs. ${(amount * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatUSD = (amount: number) => {
    return `$ ${amount.toFixed(2)}`;
  };

  return (
    <section className="bg-surface/90 rounded-2xl p-4 sm:p-6 border border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with Step Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.3)]">
            1
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-on-surface tracking-tight">
            Selecciona tu <span className="text-cyan-400">Paquete</span>
          </h2>
        </div>

        {/* Currency / Exchange Rate Indicator */}
        {exchangeRate > 1 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-cyan-500/30 text-[11px] font-bold text-on-surface-variant self-start sm:self-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Tasa BCV: <span className="text-cyan-400 font-extrabold">{exchangeRate.toFixed(2)} VES</span>
          </div>
        )}
      </div>

      {/* Category Tabs (e.g. [ Golds ] [ Paquetes ]) */}
      {categories.length > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6 p-1 bg-surface-container-lowest rounded-xl border border-cyan-500/20 w-fit mx-auto relative z-10">
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={`cat-${cat}-${idx}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all duration-200 capitalize ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,210,255,0.25)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Packages */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 relative z-10">
        {filteredPackages.map((pkg, index) => {
          const isSelected = selectedPackage?.id === pkg.id;
          const currentPrice = pkg.price;

          return (
            <div
              key={`${pkg.id || 'pkg'}-${index}`}
              onClick={() => onSelect(pkg)}
              className={`group relative rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-surface-container to-surface-container-low border-2 border-cyan-400 shadow-[0_0_24px_rgba(0,210,255,0.35)] scale-[1.02]'
                  : 'bg-surface-container-low border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-surface-container hover:shadow-[0_0_15px_rgba(0,210,255,0.15)]'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2 left-2 z-10 text-cyan-400 bg-surface-container-lowest/90 rounded-full p-0.5 shadow-[0_0_8px_rgba(0,210,255,0.5)]">
                  <CheckCircle2 size={16} className="fill-cyan-400 text-slate-950" />
                </div>
              )}

              {/* Top Bar: Info Icon & Extra Bonus Badge */}
              <div className="p-3 pb-1 flex items-center justify-between w-full relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfoModal(pkg);
                  }}
                  className={`p-1 rounded-full text-on-surface-variant hover:text-cyan-400 transition-colors ${isSelected ? 'opacity-0 pointer-events-none' : ''}`}
                  title="Detalles del paquete"
                >
                  <Info size={14} />
                </button>

                {pkg.bonus ? (
                  <div className="ml-auto">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(0,210,255,0.4)]">
                      +{pkg.bonus} Extra
                    </span>
                  </div>
                ) : (
                  <div className="ml-auto h-4"></div>
                )}
              </div>

              {/* Center 3D Graphic Icon */}
              <div className="py-2 px-3 flex flex-col items-center justify-center text-center">
                <div className="my-1 transform transition-transform group-hover:scale-105 duration-200 flex items-center justify-center min-h-[64px]">
                  <PackageIcon pkg={pkg} gameCurrency={gameCurrency} size={58} />
                </div>

                {/* Amount / Title */}
                {pkg.title ? (
                  <h4 className="text-on-surface font-extrabold text-xs sm:text-sm mt-2 text-center line-clamp-2 px-1 min-h-[36px] flex items-center justify-center">
                    {pkg.title}
                  </h4>
                ) : (
                  <div className="mt-2 text-center">
                    <span className="text-on-surface font-black text-sm sm:text-base tracking-tight">
                      {pkg.amount}
                    </span>
                    <span className="text-on-surface-variant text-xs ml-1 font-semibold">
                      {pkg.currency || gameCurrency}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Price Bar (Matching NexPlay Cyan Theme) */}
              <div className={`mt-3 border-t px-2 sm:px-3 py-2 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap transition-colors ${
                isSelected 
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300' 
                  : 'bg-surface-container-lowest/80 border-cyan-500/20 text-cyan-400'
              }`}>
                <span className="font-black text-xs sm:text-sm">
                  {exchangeRate > 1 ? formatBs(currentPrice) : formatUSD(currentPrice)}
                </span>
                {exchangeRate > 1 && (
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    ({formatUSD(currentPrice)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Accordion (Información del Producto) */}
      <div className="mt-6 rounded-2xl bg-surface-container-low border border-cyan-500/20 overflow-hidden relative z-10">
        <button
          onClick={() => setIsProductInfoOpen(!isProductInfoOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Info size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                Información del <span className="text-cyan-400">Producto</span>
              </h4>
              <p className="text-xs text-on-surface-variant">Toca para ver detalles</p>
            </div>
          </div>
          <div className="text-cyan-400">
            {isProductInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {isProductInfoOpen && (
          <div className="p-4 pt-2 border-t border-cyan-500/20 text-xs text-on-surface-variant space-y-3">
            <div className="flex items-start gap-2.5">
              <Zap size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-on-surface font-semibold">Entrega 100% Instantánea:</strong>
                <p className="text-on-surface-variant mt-0.5">Las recargas se procesan de manera inmediata una vez confirmado el pago.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-on-surface font-semibold">Garantía y Seguridad Oficial:</strong>
                <p className="text-on-surface-variant mt-0.5">Recargas realizadas a través de canales oficiales y autorizados con total seguridad.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HelpCircle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-on-surface font-semibold">Requisitos:</strong>
                <p className="text-on-surface-variant mt-0.5">Ingresa tu ID de jugador de {gameName} o correo para tarjetas de regalo en el paso anterior.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_30px_rgba(0,210,255,0.25)] relative animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center">
              <PackageIcon pkg={showInfoModal} gameCurrency={gameCurrency} size={54} />
            </div>
            <h3 className="text-on-surface font-black text-lg mb-1">
              {showInfoModal.title || `${showInfoModal.amount} ${showInfoModal.currency || gameCurrency}`}
            </h3>
            {showInfoModal.bonus ? (
              <p className="text-cyan-400 text-xs font-bold mb-3">
                Incluye +{showInfoModal.bonus} Extra de Bonificación
              </p>
            ) : null}

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-cyan-500/20 mb-4 text-xs space-y-2 text-left text-on-surface-variant">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Precio en Bolívares (VES):</span>
                <span className="text-cyan-400 font-bold">
                  {formatBs(showInfoModal.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Precio en Dólares (USD):</span>
                <span className="text-on-surface font-bold">
                  {formatUSD(showInfoModal.price)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelect(showInfoModal);
                setShowInfoModal(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_16px_rgba(0,210,255,0.4)] mb-2"
            >
              Seleccionar este Paquete
            </button>
            <button
              onClick={() => setShowInfoModal(null)}
              className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

