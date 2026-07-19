const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `return res.json({ success: true, message: 'Notification sent successfully', hankGamesResult: { error: 'Invalid productId format for HankGames' } });`,
  `hankGamesResult = { error: 'Invalid productId format for HankGames' };
            throw new Error("Invalid productId");`
);

code = code.replace(
  `return res.json({ success: true, message: 'Notification sent', hankGamesResult: { error: 'Invalid productId format for HankGames' } });`,
  `hankGamesResult = { error: 'Invalid productId format for HankGames' };
            throw new Error("Invalid productId");`
);

fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts to not return early.');
