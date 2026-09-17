const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `{selectedOrderDetails.receiptUrl && (`;
const insertion = `
              {selectedOrderDetails.assaxResult && (
                <div className="mt-4 border-t border-glass-border pt-4">
                  <p className="text-on-surface-variant font-bold mb-2">Resultado Assax Store</p>
                  <pre className="w-full bg-black/40 rounded-lg p-3 border border-glass-border text-xs text-on-surface whitespace-pre-wrap font-mono overflow-auto max-h-32">
                    {JSON.stringify(selectedOrderDetails.assaxResult, null, 2)}
                  </pre>
                </div>
              )}
`;

code = code.replace(target, insertion + target);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Patched AdminPanel to show assaxResult');
