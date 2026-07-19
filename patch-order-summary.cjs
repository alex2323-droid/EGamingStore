const fs = require('fs');
let code = fs.readFileSync('src/components/OrderSummary.tsx', 'utf8');

const targetCode = `      }).then(async (response) => {
        if (!response.ok) {`;

const replaceCode = `      }).then(async (response) => {
        if (response.ok) {
          const resData = await response.json();
          if (resData.hankGamesResult) {
            // Update order in Firestore with the API result
            try {
              await updateDoc(doc(db, 'orders', newOrder.id), {
                hankGamesResult: resData.hankGamesResult
              });
            } catch (e) {
              console.error('Failed to update order with hankGamesResult', e);
            }
          }
        }
        if (!response.ok) {`;

if (code.includes(targetCode)) {
  code = code.replace(targetCode, replaceCode);
  // add updateDoc import if not present
  if (!code.includes('updateDoc')) {
    code = code.replace(/setDoc,?\s*/, 'setDoc, updateDoc, ');
  }
  fs.writeFileSync('src/components/OrderSummary.tsx', code);
  console.log('Patched OrderSummary.tsx');
} else {
  console.log('Target code not found in OrderSummary.tsx');
}
