const fs = require('fs');
let code = fs.readFileSync('src/components/GameRecharge.tsx', 'utf8');

code = code.replace(
  'import { PromoCode, Game, GamePackage, PaymentMethod, Order } from \'../types\';',
  'import { PromoCode, Game, GamePackage, PaymentMethod, Order, SiteSettings } from \'../types\';'
);

code = code.replace(
  'interface Props {\n  game: Game;\n  paymentMethods: PaymentMethod[];',
  'interface Props {\n  game: Game;\n  paymentMethods: PaymentMethod[];\n  siteSettings?: SiteSettings | null;'
);

code = code.replace(
  'export default function GameRecharge({ game, paymentMethods, promoCodes, onBack, onCheckoutSuccess }: Props) {',
  'export default function GameRecharge({ game, paymentMethods, promoCodes, onBack, onCheckoutSuccess, siteSettings }: Props) {'
);

code = code.replace(
  '<PackageSelection \n            packages={game.packages}\n            selectedPackage={selectedPackage}\n            onSelect={setSelectedPackage}\n          />',
  '<PackageSelection \n            packages={game.packages}\n            selectedPackage={selectedPackage}\n            onSelect={setSelectedPackage}\n            exchangeRate={siteSettings?.exchangeRate}\n          />'
);

code = code.replace(
  '<OrderSummary \n              game={game}\n              selectedPackage={selectedPackage}\n              selectedPayment={selectedPayment}\n              isVerified={isVerified}\n              playerId={playerId}\n              promoCodes={promoCodes}\n              onCheckoutSuccess={onCheckoutSuccess}\n            />',
  '<OrderSummary \n              game={game}\n              selectedPackage={selectedPackage}\n              selectedPayment={selectedPayment}\n              isVerified={isVerified}\n              playerId={playerId}\n              promoCodes={promoCodes}\n              exchangeRate={siteSettings?.exchangeRate}\n              onCheckoutSuccess={onCheckoutSuccess}\n            />'
);

fs.writeFileSync('src/components/GameRecharge.tsx', code);
console.log('Done');
