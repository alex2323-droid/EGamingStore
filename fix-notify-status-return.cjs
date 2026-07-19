const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "res.json({ success: true, message: 'Notification sent' });",
  "res.json({ success: true, message: 'Notification sent', hankGamesResult });"
);

fs.writeFileSync('server.ts', code);
console.log('Fixed notify-order-status return.');
