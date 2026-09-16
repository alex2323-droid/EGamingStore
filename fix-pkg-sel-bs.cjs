const fs = require('fs');
let code = fs.readFileSync('src/components/PackageSelection.tsx', 'utf8');

const replacement = `
              <div className="flex flex-col items-center gap-1 mt-3">
                {pkg.discountPercentage && (
                  <span className="text-[10px] text-on-surface-variant line-through">
                    {exchangeRate ? \`Bs. \${(pkg.price * exchangeRate).toFixed(2)}\` : \`\$\${pkg.price.toFixed(2)}\`}
                  </span>
                )}
                <div className={\`px-3 py-1 rounded-full text-xs font-semibold \${
                  isSelected ? 'btn-primary text-white' : 'bg-surface-variant text-primary'
                }\`}>
                  {exchangeRate 
                    ? \`Bs. \${(pkg.discountPercentage ? (pkg.price * (1 - pkg.discountPercentage / 100)) : pkg.price) * exchangeRate).toFixed(2)}\` 
                    : \`\$\${pkg.discountPercentage ? (pkg.price * (1 - pkg.discountPercentage / 100)).toFixed(2) : pkg.price.toFixed(2)}\`}
                </div>
                {exchangeRate && (
                  <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    $ {(pkg.discountPercentage ? (pkg.price * (1 - pkg.discountPercentage / 100)) : pkg.price).toFixed(2)}
                  </div>
                )}
              </div>
`;

code = code.replace(
  /<div className="flex flex-col items-center gap-1 mt-3">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  replacement + '            </div>'
);

fs.writeFileSync('src/components/PackageSelection.tsx', code);
console.log('Done');
