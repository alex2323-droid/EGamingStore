const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCode = `        }).then(async (response) => {
          if (!response.ok) {`;

const replaceCode = `        }).then(async (response) => {
          if (response.ok) {
            const resData = await response.json();
            if (resData.hankGamesResult) {
              // Update order in Firestore with the API result
              try {
                await updateDoc(doc(db, 'orders', updatedOrder.id), {
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
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx');
} else {
  console.log('Target code not found in App.tsx');
}
