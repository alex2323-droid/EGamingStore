const fs = require('fs');
let code = fs.readFileSync('src/components/PlayerVerification.tsx', 'utf8');

code = code.replace(
  `body: JSON.stringify({ packageId: packageIdToUse, playerId: playerId })`,
  `body: JSON.stringify({ packageId: packageIdToUse, playerId: playerId, gameId: game.id })`
);

fs.writeFileSync('src/components/PlayerVerification.tsx', code);
console.log('Patched PlayerVerification to send gameId');
