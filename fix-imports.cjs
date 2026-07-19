const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('updateDoc,')) {
  code = code.replace(/setDoc,?\s*/, 'setDoc, updateDoc, ');
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added updateDoc to imports in App.tsx');
}
