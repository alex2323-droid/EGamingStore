const fs = require('fs');
let code = fs.readFileSync('src/components/OrderSummary.tsx', 'utf8');

code = code.replace(
  '  promoCodes?: PromoCode[];',
  '  promoCodes?: PromoCode[];\n  exchangeRate?: number;'
);

code = code.replace(
  'export default function OrderSummary({ game, selectedPackage, selectedPayment, isVerified, playerId, promoCodes = [], onCheckoutSuccess }: Props) {',
  'export default function OrderSummary({ game, selectedPackage, selectedPayment, isVerified, playerId, promoCodes = [], exchangeRate, onCheckoutSuccess }: Props) {'
);

const originalCalculatePrice = `
  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    let price = selectedPackage.price;
    
    // 1. Package Discount
    if (selectedPackage.discountPercentage) {
      price = price * (1 - (selectedPackage.discountPercentage / 100));
    }
    
    // 2. Promo Code Discount
    if (appliedPromo) {
      price = price * (1 - (appliedPromo.discountPercentage / 100));
    }
    
    return price;
  };
`;

const newCalculatePrice = `
  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    let price = selectedPackage.price;
    
    // 1. Package Discount
    if (selectedPackage.discountPercentage) {
      price = price * (1 - (selectedPackage.discountPercentage / 100));
    }
    
    // 2. Promo Code Discount
    if (appliedPromo) {
      price = price * (1 - (appliedPromo.discountPercentage / 100));
    }
    
    return price;
  };

  const calculateFinalPriceVES = () => {
    return calculateFinalPrice() * (exchangeRate || 1);
  };
`;

code = code.replace(
  /const calculateFinalPrice = \(\) => \{[\s\S]*?return price;\n  \};/,
  newCalculatePrice
);

fs.writeFileSync('src/components/OrderSummary.tsx', code);
console.log('Done');
