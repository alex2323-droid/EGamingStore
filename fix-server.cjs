const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace HANKGAMES logic in validate-player
code = code.replace(
  /app\.post\('\/api\/validate-player'[\s\S]*?\/\/ HankGames Webhook Listener/,
  `app.post('/api/validate-player', async (req, res) => {
    try {
      const { packageId, playerId } = req.body;
      if (!packageId || !playerId) {
        return res.status(400).json({ error: 'Missing packageId or playerId' });
      }

      const apiKey = process.env.ASSAX_API_KEY || 'loot_9f943d83e91023c51ab2c40ab744afd1';
      
      // TODO: IMPLEMENT ASSAX STORE VALIDATION
      // const validateRes = await fetch(\`https://api.assax.store/...\`, { ... });
      
      console.log('Validando jugador con Assax API Key:', apiKey.substring(0, 8) + '...');
      
      // MOCK RESPUESTA TEMPORAL HASTA TENER LA DOCUMENTACIÓN:
      return res.json({ name: "Jugador Validado (Assax)", userId: playerId, success: true });

    } catch (error: any) {
      console.error('Error validating player:', error);
      res.status(500).json({ error: error.message || 'Failed to validate player' });
    }
  });

  // Assax Store Webhook Listener (Si aplica)`
);

// We also need to strip out the old HankGames top-up logic in /api/orders
// Let's just find and replace the hankgames parts carefully
code = code.replace(
  /if \(process\.env\.HANKGAMES_API_USER && process\.env\.HANKGAMES_API_PASS\) \{[\s\S]*?\} \/\/ end else for valid ID\n        \} catch \(hgError\) \{[\s\S]*?\}/g,
  `if (process.env.ASSAX_API_KEY || true) {
          try {
             console.log("Procesando recarga con Assax Store...");
             // TODO: IMPLEMENT ASSAX STORE TOP-UP
             hankGamesResult = { success: true, message: "Mock Assax Top-up Success" };
          } catch(err) {
             console.error("Assax Error:", err);
             hankGamesResult = { error: String(err) };
          }
        }`
);

// We have it twice (one in the new order, one in the status update)
// Let's just do a blanket replace for HANKGAMES references
code = code.replace(/HANKGAMES/g, 'ASSAX');
code = code.replace(/hankGamesResult/g, 'assaxResult');

fs.writeFileSync('server.ts', code);
console.log('server.ts updated');
