const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For the new order creation automation
code = code.replace(
  "console.log(`Attempting automated purchase for new order ${order.id} with HankGames...`);",
  `if (!/^[a-fA-F0-9]{24}$/.test(order.packageId || '')) {
            console.log(\`Skipping automated purchase for new order \${order.id} because packageId '\${order.packageId}' is not a valid 24-hex HankGames productId.\`);
            return res.json({ success: true, message: 'Notification sent successfully', hankGamesResult: { error: 'Invalid productId format for HankGames' } });
          }
          console.log(\`Attempting automated purchase for new order \${order.id} with HankGames...\`);`
);

// For the status update automation
code = code.replace(
  "console.log(`Attempting automated purchase for order ${order.id} with HankGames...`);",
  `if (!/^[a-fA-F0-9]{24}$/.test(order.packageId || '')) {
            console.log(\`Skipping automated purchase for order \${order.id} because packageId '\${order.packageId}' is not a valid 24-hex HankGames productId.\`);
            return res.json({ success: true, message: 'Notification sent', hankGamesResult: { error: 'Invalid productId format for HankGames' } });
          }
          console.log(\`Attempting automated purchase for order \${order.id} with HankGames...\`);`
);

fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts to check productId format before calling HankGames.');
