const fs = require('fs');
let code = fs.readFileSync('src/components/PackageSelection.tsx', 'utf8');

code = code.replace(
  'interface Props {\n  packages: GamePackage[];',
  'interface Props {\n  packages: GamePackage[];\n  exchangeRate?: number;'
);

code = code.replace(
  'export default function PackageSelection({ packages, selectedPackage, onSelect }: Props) {',
  'export default function PackageSelection({ packages, selectedPackage, onSelect, exchangeRate }: Props) {'
);

const priceBlock = `
                {pkg.discountPercentage && (
                  <span className="text-[10px] text-on-surface-variant line-through">${'$'}{pkg.price.toFixed(2)}</span>
                )}
                <div className={\`px-3 py-1 rounded-full text-xs font-semibold \${
                  isSelected ? 'btn-primary text-white' : 'bg-surface-variant text-primary'
                }\`}>
                  ${'$'}{pkg.discountPercentage ? (pkg.price * (1 - pkg.discountPercentage / 100)).toFixed(2) : pkg.price.toFixed(2)}
                </div>
                {exchangeRate && (
                  <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    Bs. {((pkg.discountPercentage ? (pkg.price * (1 - pkg.discountPercentage / 100)) : pkg.price) * exchangeRate).toFixed(2)}
                  </div>
                )}
`;

code = code.replace(
  /\{pkg\.discountPercentage && \([\s\S]*?Bs \{pkg\.price\.toFixed\(2\)\}[\s\S]*?\)\}[\s\S]*?<div className=\{`px-3 py-1 rounded-full text-xs font-semibold \$\{[\s\S]*?isSelected \? 'btn-primary text-white' : 'bg-surface-variant text-primary'[\s\S]*?}\`}>[\s\S]*?Bs \{pkg\.discountPercentage \? \(pkg\.price \* \(1 - pkg\.discountPercentage \/ 100\)\)\.toFixed\(2\) : pkg\.price\.toFixed\(2\)\}[\s\S]*?<\/div>/,
  priceBlock
);

fs.writeFileSync('src/components/PackageSelection.tsx', code);
console.log('Done');
