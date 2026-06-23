export interface GamePackage {
  id: string;
  amount: number;
  currency: string;
  price: number;
  bonus?: number;
  iconUrl: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  iconType: 'payments' | 'account_balance' | 'credit_card';
}

export interface Game {
  id: string;
  name: string;
  publisher: string;
  bannerUrl: string;
  cardUrl: string;
  currencyName: string;
  category: 'mobile' | 'pc' | 'console';
  packages: GamePackage[];
}

export interface Order {
  id: string;
  date: string;
  gameName: string;
  packageName: string;
  price: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}
