import { GamePackage } from '../types';

interface Props {
  packages: GamePackage[];
  selectedPackage: GamePackage | null;
  onSelect: (pkg: GamePackage) => void;
}

export default function PackageSelection({ packages, selectedPackage, onSelect }: Props) {
  return (
    <section className="glass-panel rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-sm font-semibold text-primary border border-glass-border">2</div>
        <h2 className="font-display text-lg font-semibold text-on-surface">Selecciona tu Paquete</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(packages || []).map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          
          return (
            <div 
              key={pkg.id}
              onClick={() => onSelect(pkg)}
              className={`relative rounded-xl p-4 cursor-pointer transition-colors text-center flex flex-col items-center justify-between min-h-[160px] ${
                isSelected 
                  ? 'bg-surface-container-low border-2 border-primary shadow-[0_0_15px_rgba(238,119,8,0.1)]' 
                  : 'bg-surface-container-low border-2 border-glass-border hover:border-primary/50'
              }`}
            >
              {pkg.bonus && (
                <div className="absolute -top-3 right-2 bg-gradient-to-r from-gradient-orange-start to-gradient-orange-end text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
                  +{pkg.bonus} Extra
                </div>
              )}
              
              <img 
                src={pkg.iconUrl || undefined} 
                alt={`${pkg.amount} ${pkg.currency}`} 
                className={`w-16 h-16 object-contain mb-2 ${isSelected ? 'drop-shadow-[0_0_12px_rgba(0,170,242,0.6)] w-20 h-20' : 'drop-shadow-[0_0_8px_rgba(0,170,242,0.5)]'}`} 
              />
              
              <div>
                <h3 className="font-display text-lg font-bold text-on-surface">{pkg.amount}</h3>
                <p className="text-sm text-on-surface-variant font-medium">{pkg.currency}</p>
              </div>
              
              <div className="flex flex-col items-center gap-1 mt-3">
                {pkg.discountPercentage && (
                  <span className="text-[10px] text-on-surface-variant line-through">Bs {pkg.price.toFixed(2)}</span>
                )}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isSelected ? 'btn-primary text-white' : 'bg-surface-variant text-primary'
                }`}>
                  Bs {pkg.discountPercentage ? (pkg.price * (1 - pkg.discountPercentage / 100)).toFixed(2) : pkg.price.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
