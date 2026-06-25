export interface GamePackage {
  id: string;
  amount: number;
  currency: string;
  price: number;
  bonus?: number;
  discountPercentage?: number;
  iconUrl: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
  usageCount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  iconType: 'payments' | 'account_balance' | 'credit_card';
  instructions?: string;
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
  status: 'completed' | 'pending' | 'failed' | 'rejected';
  paymentMethod: string;
  referenceNumber?: string;
  userId?: string;
  userEmail?: string;
  playerId?: string;
}

export interface SiteSettings {
  mascotHomeUrl: string;
  mascotSupportUrl: string;
  mascotLoginUrl: string;
  showMascotHome: boolean;
  showMascotSupport: boolean;
  showMascotLogin: boolean;
  paymentMethods: PaymentMethod[];
}
