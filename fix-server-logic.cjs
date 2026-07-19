const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `if (!/^[a-fA-F0-9]{24}$/.test(order.packageId || '')) {
            console.log(\`Skipping automated purchase for new order \${order.id} because packageId '\${order.packageId}' is not a valid 24-hex HankGames productId.\`);
            hankGamesResult = { error: 'Invalid productId format for HankGames' };
            console.log("Skipping HankGames automation: Invalid productId");
          }
          console.log(\`Attempting automated purchase for new order \${order.id} with HankGames...\`);
          const tokenRes = await fetch('https://api.hankgames.com/v1/reseller/api/auth/token', {`,
  `if (!/^[a-fA-F0-9]{24}$/.test(order.packageId || '')) {
            console.log(\`Skipping automated purchase for new order \${order.id} because packageId '\${order.packageId}' is not a valid 24-hex HankGames productId.\`);
            hankGamesResult = { error: 'Invalid productId format for HankGames' };
          } else {
            console.log(\`Attempting automated purchase for new order \${order.id} with HankGames...\`);
            const tokenRes = await fetch('https://api.hankgames.com/v1/reseller/api/auth/token', {`
);

code = code.replace(
  `          } else {
            const errText = await tokenRes.text(); console.warn("HankGames Auth Warning (New Order):", errText); hankGamesResult = { error: "Auth failed: " + errText };
          }
        } catch (hgError) {`,
  `          } else {
            const errText = await tokenRes.text(); console.warn("HankGames Auth Warning (New Order):", errText); hankGamesResult = { error: "Auth failed: " + errText };
          }
          } // end else for valid ID
        } catch (hgError) {`
);


code = code.replace(
  `if (!/^[a-fA-F0-9]{24}$/.test(order.packageId || '')) {
            console.log(\`Skipping automated purchase for order \${order.id} because packageId '\${order.packageId}' is not a valid 24-hex HankGames productId.\`);
            hankGamesResult = { error: 'Invalid productId format for HankGames' };
            console.log("Skipping HankGames automation: Invalid productId");
          }
          console.log(\`Attempting automated purchase for order \${order.id} with HankGames...\`);
          // 1. Get Token
          const tokenRes = await fetch('https://api.hankgames.com/v1/reseller/api/auth/token', {`,
  `if (!/^[a-fA-F0-9]{24}$/.test(order.packageId || '')) {
            console.log(\`Skipping automated purchase for order \${order.id} because packageId '\${order.packageId}' is not a valid 24-hex HankGames productId.\`);
            hankGamesResult = { error: 'Invalid productId format for HankGames' };
          } else {
            console.log(\`Attempting automated purchase for order \${order.id} with HankGames...\`);
            const tokenRes = await fetch('https://api.hankgames.com/v1/reseller/api/auth/token', {`
);

code = code.replace(
  `          } else {
            const errText = await tokenRes.text(); console.warn("HankGames Auth Warning:", errText); hankGamesResult = { error: "Auth failed: " + errText };
          }
        } catch (hgError) {`,
  `          } else {
            const errText = await tokenRes.text(); console.warn("HankGames Auth Warning:", errText); hankGamesResult = { error: "Auth failed: " + errText };
          }
          } // end else for valid ID
        } catch (hgError) {`
);


fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts logic block.');
