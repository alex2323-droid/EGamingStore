const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const validateRes = await fetch(`https://api.hankgames.com/v1/reseller/api/product/${packageId}/validate`, {',
  'const validateRes = await fetch(`https://api.hankgames.com/v1/reseller/api/validate-user/${packageId}`, {'
);

fs.writeFileSync('server.ts', code);
console.log('Fixed validate-player endpoint');
