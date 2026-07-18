const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const hankGamesAutomationCode = `
      // Automatically purchase from HankGames upon order creation (for testing/automation)
      let hankGamesResult = null;
      if (process.env.HANKGAMES_API_USER && process.env.HANKGAMES_API_PASS) {
        try {
          console.log(\`Attempting automated purchase for new order \${order.id} with HankGames...\`);
          const tokenRes = await fetch('https://api.hankgames.com/v1/reseller/api/auth/token', {
            method: 'POST',
            headers: {
              'x-client-id': process.env.HANKGAMES_API_USER,
              'x-client-secret': process.env.HANKGAMES_API_PASS,
              'accept': 'application/json'
            }
          });
          
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            const token = tokenData.token || tokenData.data?.token || tokenData.access_token;
            
            let userId = order.playerId || '';
            let zoneId = '';
            const zoneMatch = userId.match(/^(.*?)[(\\s]+(\\d+)[)\\s]*$/);
            if (zoneMatch) {
              userId = zoneMatch[1].trim();
              zoneId = zoneMatch[2].trim();
            }

            const deliverPayload = {
              externalOrderId: order.id,
              data: {
                productId: order.packageId || '',
                quantity: "1",
                userId: userId,
                ...(zoneId ? { zoneId: zoneId } : {})
              }
            };
            
            console.log("Sending HankGames Transaction Payload on New Order:", JSON.stringify(deliverPayload));
            const deliverRes = await fetch('https://api.hankgames.com/v1/reseller/api/deliver-product', {
              method: 'POST',
              headers: {
                'Authorization': \`Bearer \${token}\`,
                'accept': 'application/json',
                'content-type': 'application/json'
              },
              body: JSON.stringify(deliverPayload)
            });
            
            if (deliverRes.ok) {
              const deliverData = await deliverRes.json();
              console.log("HankGames transaction success (New Order):", deliverData);
              hankGamesResult = deliverData;
            } else {
               const errText = await deliverRes.text();
               console.error("HankGames transaction failed (New Order):", errText);
               hankGamesResult = { error: errText };
            }
          } else {
            console.warn("HankGames Auth Warning (New Order):", await tokenRes.text());
          }
        } catch (hgError) {
          console.error("HankGames Automation Error (New Order):", hgError);
        }
      }
`;

content = content.replace(
  "const safeCustomerEmail = customerEmail && typeof customerEmail === 'string' ? customerEmail.trim() : 'N/A';",
  "const safeCustomerEmail = customerEmail && typeof customerEmail === 'string' ? customerEmail.trim() : 'N/A';\n" + hankGamesAutomationCode
);

fs.writeFileSync('server.ts', content, 'utf8');
console.log("Patched server.ts");
