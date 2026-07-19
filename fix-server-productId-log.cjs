const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `hankGamesResult = { error: 'Invalid productId format for HankGames' };
            throw new Error("Invalid productId");`,
  `hankGamesResult = { error: 'Invalid productId format for HankGames' };
            console.log("Skipping HankGames automation: Invalid productId");`
);
code = code.replace(
  `hankGamesResult = { error: 'Invalid productId format for HankGames' };
            throw new Error("Invalid productId");`,
  `hankGamesResult = { error: 'Invalid productId format for HankGames' };
            console.log("Skipping HankGames automation: Invalid productId");`
);

fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts to not throw error on invalid productId.');
