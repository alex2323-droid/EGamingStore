const fs = require('fs');
let code = fs.readFileSync('src/components/OrderSummary.tsx', 'utf8');
if (!code.includes('updateDoc,')) {
  code = code.replace(/setDoc,?\s*/, 'setDoc, updateDoc, ');
  fs.writeFileSync('src/components/OrderSummary.tsx', code);
  console.log('Added updateDoc to imports in OrderSummary.tsx');
}
