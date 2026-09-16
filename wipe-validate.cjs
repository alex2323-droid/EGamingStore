const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/api\/validate-player'[\s\S]*?app\.post\('\/api\/assax\/webhook'/;

const replacement = `app.post('/api/validate-player', async (req, res) => {
    try {
      const { packageId, playerId } = req.body;
      if (!packageId || !playerId) {
        return res.status(400).json({ error: 'Missing packageId or playerId' });
      }

      res.json({ name: "Jugador Validado (Assax)", userId: playerId, success: true });
    } catch (error: any) {
      console.error('Error validating player:', error);
      res.status(500).json({ error: error.message || 'Failed to validate player' });
    }
  });

  app.post('/api/assax/webhook'`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log('Fixed block');
