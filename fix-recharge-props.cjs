const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<GameRecharge\n          game={selectedGame}',
  '<GameRecharge\n          game={selectedGame}\n          siteSettings={siteSettings}'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Done');
