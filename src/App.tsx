import { useState, useEffect } from 'react';
import { Game, Order } from './types';
import { GAMES, PAYMENT_METHODS } from './data';
import { MessageCircle } from 'lucide-react';
import Header from './components/Header';
import Home from './components/Home';
import GameRecharge from './components/GameRecharge';
import OrdersHistory from './components/OrdersHistory';
import Support from './components/Support';
import Profile from './components/Profile';
import MobileNav from './components/MobileNav';
import GmailInbox from './components/GmailInbox';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas (Sesión periódica requerida)

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'support' | 'profile' | 'inbox' | 'admin'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Fetch games from API
  useEffect(() => {
    const loadGames = async () => {
      try {
        const gamesSnap = await getDocs(collection(db, 'games'));
        if (!gamesSnap.empty) {
          const loadedGames = gamesSnap.docs.map(d => d.data() as Game);
          setGames(loadedGames);
        } else {
          // If DB is empty, fall back to initial GAMES
          setGames(GAMES);
        }
      } catch (error) {
        console.error('Failed to load games, using defaults', error);
        setGames(GAMES);
      } finally {
        setLoadingGames(false);
      }
    };
    loadGames();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check session expiration
        let lastLoginTime = 0;
        try {
          const lastLoginTimeStr = localStorage.getItem('lastLoginTime');
          if (!lastLoginTimeStr) {
            // New login or registration, initialize the timer
            lastLoginTime = Date.now();
            localStorage.setItem('lastLoginTime', lastLoginTime.toString());
          } else {
            lastLoginTime = parseInt(lastLoginTimeStr, 10);
          }
        } catch (e) {
          console.warn('localStorage access denied', e);
          lastLoginTime = Date.now(); // assume fresh if we can't read
        }
        
        if (Date.now() - lastLoginTime > SESSION_TIMEOUT_MS) {
          // Session expired
          signOut(auth).then(() => {
            setIsAuthenticated(false);
          });
        } else {
          setIsAuthenticated(true);
          const userEmail = user.email || '';
          setIsAdmin(userEmail.toLowerCase() === 'egamingstore1@gmail.com' || userEmail.toLowerCase() === 'alexparababi23@gmail.com' || userEmail.toLowerCase() === 'avila2004alexparababi@gmail.com');
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check session timeout periodically every 15 seconds
    const interval = setInterval(() => {
      if (auth.currentUser) {
        let lastLoginTime = 0;
        try {
          const lastLoginTimeStr = localStorage.getItem('lastLoginTime');
          lastLoginTime = lastLoginTimeStr ? parseInt(lastLoginTimeStr, 10) : 0;
        } catch (e) {
          console.warn('localStorage access denied', e);
          return;
        }
        if (lastLoginTime > 0 && Date.now() - lastLoginTime > SESSION_TIMEOUT_MS) {
          signOut(auth).then(() => {
            setIsAuthenticated(false);
          });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (tab: 'home' | 'orders' | 'support' | 'profile' | 'inbox' | 'admin') => {
    setActiveTab(tab);
    if (tab !== 'home') {
      setSelectedGame(null); // Clear game selection if navigating away
    }
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setActiveTab('home'); // Ensure we are on home tab when viewing a game
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckoutSuccess = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setSelectedGame(null);
    setActiveTab('orders'); // Jump to orders history after a successful purchase
  };

  const handleUpdateGames = async (updatedGames: Game[]) => {
    setGames(updatedGames);
    try {
      const batch = writeBatch(db);
      
      const gamesSnap = await getDocs(collection(db, 'games'));
      const existingIds = gamesSnap.docs.map(d => d.id);
      const newIds = updatedGames.map(g => g.id);
      
      for (const id of existingIds) {
        if (!newIds.includes(id)) {
          batch.delete(doc(db, 'games', id));
        }
      }
      
      for (const game of updatedGames) {
        const cleanGame = JSON.parse(JSON.stringify(game));
        batch.set(doc(db, 'games', cleanGame.id), cleanGame);
      }
      
      await batch.commit();
      return true;
    } catch (err: any) {
      console.error('Failed to save games update to backend', err);
      return false;
    }
  };

  const renderContent = () => {
    if (loadingGames) return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
    if (activeTab === 'inbox') return <GmailInbox />;
    if (activeTab === 'orders') return <OrdersHistory orders={orders} />;
    if (activeTab === 'support') return <Support />;
    if (activeTab === 'profile') return <Profile orders={orders} />;
    if (activeTab === 'admin' && isAdmin) return <AdminPanel games={games} onUpdateGames={handleUpdateGames} />;
    
    // Default to 'home' tab
    if (selectedGame) {
      return (
        <GameRecharge 
          game={selectedGame} 
          paymentMethods={PAYMENT_METHODS} 
          onBack={() => setSelectedGame(null)} 
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      );
    }
    
    return <Home games={games} onSelectGame={handleSelectGame} />;
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-sans">
      <Header activeTab={activeTab} onNavigate={handleNavigate} isAdmin={isAdmin} />
      
      <main className="pt-16 flex-grow flex flex-col justify-start w-full relative">
        {renderContent()}
      </main>

      <Footer />
      <MobileNav activeTab={selectedGame ? 'game' : activeTab} onNavigate={handleNavigate as any} />

      {/* Support FAB - Only show if not on support tab */}
      {activeTab !== 'support' && (
        <button 
          onClick={() => handleNavigate('support')}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40 group"
        >
          <MessageCircle className="text-white fill-current" size={30} />
          <div className="absolute right-full mr-4 bg-surface-container-high text-on-surface text-sm font-medium py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-glass-border">
            Soporte 24/7
          </div>
        </button>
      )}
    </div>
  );
}

