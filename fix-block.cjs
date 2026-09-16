const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// There are duplicate validation endpoints causing syntax errors. We need to clear them out.
const startToken = "app.post('/api/validate-player'";
const endToken = "app.post('/api/hankgames/webhook'";

const startIndex = code.indexOf(startToken);
const endIndex = code.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  
  const cleanMiddle = `app.post('/api/validate-player', async (req, res) => {
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

  `;
  
  code = before + cleanMiddle + after;
  fs.writeFileSync('server.ts', code);
  console.log('Fixed overlapping validation blocks');
}

