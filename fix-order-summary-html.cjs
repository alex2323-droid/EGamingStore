const fs = require('fs');
let code = fs.readFileSync('src/components/OrderSummary.tsx', 'utf8');

const replacement = `
              <div className="flex justify-between items-end">
                <span className="text-lg font-medium text-on-surface">Total</span>
                <div className="text-right">
                  <span className="font-display text-4xl font-extrabold text-primary leading-none block">
                    {selectedPayment?.currency === 'VES' && exchangeRate
                      ? \`Bs \${calculateFinalPriceVES().toFixed(2)}\`
                      : \`$ \${calculateFinalPrice().toFixed(2)}\`}
                  </span>
                  {selectedPayment?.currency === 'VES' && exchangeRate && (
                    <span className="text-sm font-medium text-on-surface-variant block mt-1">
                      (Tasa: Bs {exchangeRate})
                    </span>
                  )}
                  {selectedPayment?.currency !== 'VES' && exchangeRate && (
                    <span className="text-sm font-medium text-on-surface-variant block mt-1">
                      (Equivalente: Bs {calculateFinalPriceVES().toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </div>
`;

code = code.replace(
  /<div className="flex justify-between items-end">[\s\S]*?<span className="text-lg font-medium text-on-surface">Total<\/span>[\s\S]*?<span className="font-display text-4xl font-extrabold text-primary leading-none">[\s\S]*?\{selectedPackage \? \`Bs \$\{calculateFinalPrice\(\)\.toFixed\(2\)\}\` : 'Bs 0\.00'\}[\s\S]*?<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  replacement
);

fs.writeFileSync('src/components/OrderSummary.tsx', code);
console.log('Done');
