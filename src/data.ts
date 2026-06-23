import { Game, GamePackage, PaymentMethod } from './types';

const defaultPackages: GamePackage[] = [
  {
    id: 'pkg_100',
    amount: 100,
    currency: 'Gold',
    price: 0.99,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png',
  },
  {
    id: 'pkg_300',
    amount: 300,
    currency: 'Gold',
    price: 2.99,
    bonus: 10,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png',
  },
  {
    id: 'pkg_500',
    amount: 500,
    currency: 'Gold',
    price: 4.99,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png',
  },
];

export const GAMES: Game[] = [
  {
    id: 'blood_strike',
    name: 'Blood Strike',
    publisher: 'NetEase Games',
    bannerUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLvf6VgpMfUzP1AJyNaL8GRJh7jGhmt3ucpBAVF2j2tl_s0pIUtNcv_9799NOJtYN_HXpJwvX2qb5y3QTa8jqfhjVan0_YhPAoLmNU_lpPjJOpXm5Ab3QVtvQprAOmK_ta7WVuhhoCkiPLTOP48epbXUS8-dh6ncCLpkGwKFQ_zCyXZmajVPCJ1MViNXIxHStoNOwB5fEeEpEfRANBzNohERtCh6XUw0Asx6Ijs9-l2WIq2Q_GXGauT7cFoS',
    cardUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Gold',
    category: 'mobile',
    packages: defaultPackages
  },
  {
    id: 'free_fire',
    name: 'Free Fire',
    publisher: 'Garena',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Diamonds',
    category: 'mobile',
    packages: defaultPackages.map(p => ({ ...p, currency: 'Diamonds' }))
  },
  {
    id: 'pubg_mobile',
    name: 'PUBG Mobile',
    publisher: 'Tencent Games',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'UC',
    category: 'mobile',
    packages: defaultPackages.map(p => ({ ...p, currency: 'UC' }))
  },
  {
    id: 'valorant',
    name: 'Valorant',
    publisher: 'Riot Games',
    bannerUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'VP',
    category: 'pc',
    packages: defaultPackages.map(p => ({ ...p, currency: 'VP' }))
  },
  {
    id: 'roblox',
    name: 'Roblox',
    publisher: 'Roblox Corporation',
    bannerUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Robux',
    category: 'pc',
    packages: defaultPackages.map(p => ({ ...p, currency: 'Robux' }))
  },
  {
    id: 'psn',
    name: 'PlayStation Network',
    publisher: 'Sony',
    bannerUrl: 'https://images.unsplash.com/photo-1606144042871-331bdcb97647?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1606144042871-331bdcb97647?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'console',
    packages: defaultPackages.map(p => ({ ...p, currency: 'USD' }))
  }
];

export const PAYMENT_METHODS: PaymentMethod[] = [

  { id: 'pago_movil', name: 'Pago Móvil', iconType: 'payments' },
  { id: 'zelle', name: 'Zelle', iconType: 'account_balance' },
  { id: 'card', name: 'Card', iconType: 'credit_card' },
];
