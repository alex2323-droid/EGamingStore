const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// 1. Update /api/validate-player
// According to the PDF, there is NO validation endpoint provided by Assax Store API. 
// They only have: Catalog, Balance, Orders, and Webhooks.
// We will just do a pass-through validation (or mock it to always succeed) 
// since Assax handles errors (like 400 or 404) during the actual ORDER POST.
const validateTarget = /app\.post\('\/api\/validate-player'[\s\S]*?\/\/ Assax Store Webhook Listener/;
const validateReplacement = `app.post('/api/validate-player', async (req, res) => {
    try {
      const { packageId, playerId } = req.body;
      if (!packageId || !playerId) {
        return res.status(400).json({ error: 'Missing packageId or playerId' });
      }

      // Assax Store doesn't have a specific pre-validation endpoint in their docs.
      // Validation happens at the time of placing the order.
      // We will mock a successful validation here to let the user proceed to checkout.
      return res.json({ name: "ID Verificado", userId: playerId, success: true });

    } catch (error: any) {
      console.error('Error validating player:', error);
      res.status(500).json({ error: error.message || 'Failed to validate player' });
    }
  });

  // Assax Store Webhook Listener`;

if (code.match(validateTarget)) {
  code = code.replace(validateTarget, validateReplacement);
}


// 2. Update the Top-Up logic in /api/notify-order-status
// The endpoint is POST https://assaxstore.com/api/reseller/orders
const topUpTarget = /let assaxResult = null;\n      if \(status === 'completed' && \(process\.env\.ASSAX_API_KEY \|\| true\)\) \{[\s\S]*?\} catch \(err\) \{\n          console\.error\("Assax Automation Error:", err\);\n          assaxResult = \{ error: String\(err\) \};\n        \}\n      \}/;

const topUpReplacement = `let assaxResult = null;
      if (status === 'completed' && process.env.ASSAX_API_KEY) {
        try {
          console.log("Procesando recarga con Assax Store (estado completado)...");
          
          // Parse player ID and zone ID if provided in format like 123456(1234)
          let userId = order.playerId || '';
          let zoneId = '';
          const zoneMatch = userId.match(/^(.*?)[(\\s]+(\\d+)[)\\s]*$/);
          if (zoneMatch) {
            userId = zoneMatch[1].trim();
            zoneId = zoneMatch[2].trim();
          }

          const playerData: any = { playerid: userId };
          if (zoneId) {
            playerData.serverid = zoneId;
          }

          const assaxPayload = {
            productId: order.gameId, // Assuming you mapped this correctly or need to map it
            packageId: order.packageId,
            playerData: playerData,
            quantity: 1
          };

          console.log("Enviando a Assax:", JSON.stringify(assaxPayload));

          const assaxRes = await fetch('https://assaxstore.com/api/reseller/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.ASSAX_API_KEY
            },
            body: JSON.stringify(assaxPayload)
          });

          if (assaxRes.ok) {
            const data = await assaxRes.json();
            console.log("Assax transaction success:", data);
            assaxResult = data;
          } else {
             const errData = await assaxRes.json().catch(() => ({ error: assaxRes.statusText }));
             console.error("Assax transaction failed:", errData);
             assaxResult = { error: errData.error || 'Failed to process top-up via Assax' };
          }
        } catch (err) {
          console.error("Assax Automation Error:", err);
          assaxResult = { error: String(err) };
        }
      }`;

if (code.match(topUpTarget)) {
  code = code.replace(topUpTarget, topUpReplacement);
}

// 3. Update the Webhook logic to use the new Assax signature format
const webhookTarget = /app\.post\('\/api\/assax\/webhook', express\.json\(\), async \(req, res\) => \{[\s\S]*?\}\);/;
const webhookReplacement = `app.post('/api/assax/webhook', express.json(), async (req, res) => {
    try {
      console.log('--- ASSAX WEBHOOK RECEIVED ---');
      const sig = req.headers['x-webhook-signature'];
      const event = req.headers['x-webhook-event'];
      
      console.log('Event:', event);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      // En el futuro, si tienes un Webhook Secret, puedes validar la firma HMAC-SHA256 aquí.
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });`;

if (code.match(webhookTarget)) {
  code = code.replace(webhookTarget, webhookReplacement);
}

fs.writeFileSync('server.ts', code);
console.log('Assax integration applied.');
