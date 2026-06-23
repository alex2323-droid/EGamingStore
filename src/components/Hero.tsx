import { Game } from '../types';

interface Props {
  game: Game;
}

export default function Hero({ game }: Props) {
  return (
    <section className="relative w-full h-[250px] md:h-[400px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
      <img 
        alt={`${game.name} game banner`} 
        className="w-full h-full object-cover object-center" 
        src={game.bannerUrl || undefined} 
      />
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-16 z-20">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface drop-shadow-md">{game.name}</h1>
        <p className="text-on-surface-variant drop-shadow-md mt-1 font-medium">Recarga Instantánea</p>
      </div>
    </section>
  );
}
