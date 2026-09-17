import { Menu, User, Mail, Home, ShieldAlert } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import NexPlayLogo from './NexPlayLogo';

interface Props {
  activeTab: string;
  isAdmin?: boolean;
  onNavigate: (tab: 'home' | 'support' | 'profile' | 'inbox' | 'admin') => void;
}

export default function Header({ activeTab, isAdmin, onNavigate }: Props) {
  return (
    <header className="bg-surface/80 fixed top-0 w-full z-50 backdrop-blur-md flex justify-between items-center px-4 h-16 border-b border-glass-border">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onNavigate('support')}
          title="Menú y Soporte"
          className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'support' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <Menu size={24} />
        </button>
        <button 
          onClick={() => onNavigate('home')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${activeTab === 'home' ? 'bg-primary/15 text-primary border border-primary/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
          title="Ir al Inicio"
        >
          <Home size={16} />
          <span>Inicio</span>
        </button>
      </div>
      <button 
        onClick={() => onNavigate('home')}
        className="cursor-pointer transition-all active:scale-95 group"
      >
        <NexPlayLogo size="sm" variant="compact" showSubtitle={false} />
      </button>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeSwitcher />
        {isAdmin && (
          <button 
            onClick={() => onNavigate('admin')}
            className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'admin' ? 'bg-red-500/10 text-red-500' : 'text-on-surface-variant hover:text-red-500 hover:bg-surface-container-high'}`}
          >
            <ShieldAlert size={24} />
          </button>
        )}
        <button 
          onClick={() => onNavigate('inbox')}
          className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'inbox' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <Mail size={24} />
        </button>
        <button 
          onClick={() => onNavigate('profile')}
          className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <User size={24} />
        </button>
      </div>
    </header>
  );
}


