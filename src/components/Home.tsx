import { useState, useMemo } from 'react';
import { Search, Gamepad2, Smartphone, Monitor, Zap, ShieldCheck, Headset, ArrowRight } from 'lucide-react';
import { Game } from '../types';

interface Props {
  games: Game[];
  onSelectGame: (game: Game) => void;
}

type CategoryType = 'all' | 'mobile' | 'pc' | 'console';

export default function Home({ games, onSelectGame }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchTerm, activeCategory]);

  return (
    <div className="w-full animation-fade-in pb-24 md:pb-8">
      
      {/* Hero Section */}
      <section className="relative w-full aspect-[21/9] min-h-[400px] flex items-center justify-center overflow-hidden mb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida/AP1WRLtqGNiVUq9ESQZ5DjXAfJi3xWJjmPpbRE7iXBwwgOMSe_RdsM-w5ojFvtdvx8y65C462xzEAzpGWCxYi99RxKtEYqHglibkeI_R484etjVFGEDoIKVHI_G0GchNfY0TEH9Jx7pETpW6ZWlMFiWZdbjf8JGzhOQ6rlz-oVaQaCWckFai7rrqaHdNmJF4j_SxRPI-l-zTfdEraP_Y0-L5snUg1CcyiGz5L3qCjKbZooazKmoXRZuE1MJ0ERVn" 
            alt="E Gaming Store Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="max-w-xl space-y-6">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight uppercase tracking-tight">
              E GAMING <br/><span className="text-primary">STORE</span>
            </h1>
            <p className="text-lg text-on-surface/90 max-w-md font-medium">
              Eleva tu experiencia de juego con recargas rápidas, seguras y al mejor precio del mercado.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => {
                  document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 group transition-all"
              >
                Recargar Ahora
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => {
                  document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="glass-panel px-8 py-4 rounded-xl font-bold text-white border border-glass-border hover:bg-surface-variant/40 transition-colors"
              >
                Ver Ofertas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-16 px-4 md:px-8 bg-surface-container-lowest mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1 flex justify-center">
              <div className="absolute inset-4 bg-primary/20 blur-3xl rounded-full"></div>
              <img 
                src="https://lh3.googleusercontent.com/aida/AP1WRLvFYE4KjmgXgOmbdIhC-U-r3HD6RVibJzmT601FMJ2SGZuYCL03oW670k4zbQXtrQnbyOLSIbn_F3NgYzIDsA_cHt7usrwJ--UUXXEMsLAwGQlel1PXUY7RdUoTd2UOFPeeiqbE_qmPPdmAdRw6G7gvjzkNXPRvmJU4-P7AO_JyBjx8tZXT9P4oPTcI7c5opIugunSf_pSInIGffTpl8JOj2OrdPHgMTPdvml7sereS5pieHDNgQFBBWY8" 
                alt="E Gaming Mascot" 
                className="relative w-full max-w-md mx-auto drop-shadow-2xl z-10"
              />
            </div>
            
            <div className="space-y-10 order-1 lg:order-2">
              <div className="space-y-4">
                <span className="text-primary font-bold tracking-widest uppercase text-sm">Por qué elegirnos</span>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">Nuestra Promesa de Vuelo</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-glass-border space-y-3 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,183,133,0.15)] bg-surface-container/50">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Zap size={24} className="text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Entrega Inmediata</h3>
                  <p className="text-on-surface-variant text-sm font-medium">Recibe tus diamantes, monedas o créditos en segundos tras tu pago.</p>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl border border-glass-border space-y-3 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,183,133,0.15)] bg-surface-container/50">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={24} className="text-blue-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Pagos Seguros</h3>
                  <p className="text-on-surface-variant text-sm font-medium">Múltiples métodos de pago locales e internacionales protegidos.</p>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl border border-glass-border col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,183,133,0.15)] bg-surface-container/50 text-center sm:text-left">
                  <div className="w-14 h-14 shrink-0 bg-green-500/20 rounded-full flex items-center justify-center mt-1">
                    <Headset size={28} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">Soporte 24/7</h3>
                    <p className="text-on-surface-variant text-sm font-medium">Nuestro equipo está siempre listo para ayudarte en cualquier momento del día, con atención personalizada.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full" id="games-section">
        {/* Title & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Juegos Disponibles</h2>
            <div className="h-1.5 w-24 bg-primary rounded-full"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            {/* Categories */}
            <div className="flex bg-surface-container rounded-lg p-1 w-full sm:w-auto border border-glass-border shadow-md">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeCategory === 'all' ? 'bg-primary/20 text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveCategory('mobile')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeCategory === 'mobile' ? 'bg-primary/20 text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Smartphone size={16} /> Móvil
              </button>
              <button 
                onClick={() => setActiveCategory('pc')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeCategory === 'pc' ? 'bg-primary/20 text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Monitor size={16} /> PC
              </button>
              <button 
                onClick={() => setActiveCategory('console')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeCategory === 'console' ? 'bg-primary/20 text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Gamepad2 size={16} /> Consolas
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Buscar juego..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container border border-glass-border rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-white focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-16">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                onClick={() => onSelectGame(game)}
                className="group cursor-pointer bg-surface-container rounded-xl overflow-hidden transition-all duration-300 border border-glass-border hover:border-primary/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,183,133,0.3)] flex flex-col relative"
              >
                {/* Aspect Ratio Image Container (Portrait 3:4) */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-elevated">
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-container to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80"></div>
                  <img 
                    src={game.cardUrl || undefined} 
                    alt={game.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay Recargar Button on Hover */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-[2px]">
                    <span className="bg-primary text-background font-bold py-2 px-4 rounded-full text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg shadow-primary/30">
                      Recargar
                    </span>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-3 relative z-20 -mt-8 flex flex-col justify-end">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase mb-1 drop-shadow-md">
                    {game.category === 'mobile' ? 'Móvil' : game.category === 'pc' ? 'PC' : 'Consola'}
                  </span>
                  <h3 className="font-display text-sm md:text-base font-bold text-white leading-tight drop-shadow-md truncate">
                    {game.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-glass-border border-dashed mb-16">
            <Gamepad2 size={48} className="text-on-surface-variant mb-4" />
            <h3 className="font-display text-xl font-bold text-white mb-2">No se encontraron juegos</h3>
            <p className="text-on-surface-variant font-medium">Intenta con otros términos de búsqueda o categoría.</p>
          </div>
        )}
      </div>

      {/* Trust Section */}
      <section className="py-16 bg-surface-container relative border-y border-glass-border mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
          <div className="space-y-3">
            <div className="text-4xl text-primary font-display font-extrabold drop-shadow-lg">100k+</div>
            <div className="text-on-surface-variant font-bold text-xs md:text-sm uppercase tracking-widest">Usuarios Activos</div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl text-primary font-display font-extrabold drop-shadow-lg">1M+</div>
            <div className="text-on-surface-variant font-bold text-xs md:text-sm uppercase tracking-widest">Recargas Exitosas</div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl text-primary font-display font-extrabold drop-shadow-lg">50+</div>
            <div className="text-on-surface-variant font-bold text-xs md:text-sm uppercase tracking-widest">Juegos Disponibles</div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl text-primary font-display font-extrabold drop-shadow-lg">4.9/5</div>
            <div className="text-on-surface-variant font-bold text-xs md:text-sm uppercase tracking-widest">Satisfacción</div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none"></div>
      </section>

    </div>
  );
}
