const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /app\.post\('\/api\/validate-player'[\s\S]*?app\.get\('\/api\/assax\/catalog'/;

const replacement = `app.post('/api/validate-player', async (req, res) => {
    try {
      const { packageId, playerId, gameId } = req.body;
      if (!packageId || !playerId) {
        return res.status(400).json({ error: 'Missing packageId or playerId' });
      }

      // Parse player ID and zone ID if provided in format like 123456(1234)
      let userId = playerId || '';
      let zoneId = '';
      const zoneMatch = userId.match(/^(.*?)[(\\\\\\s]+(\\\\\\d+)[)\\\\\\s]*$/);
      if (zoneMatch) {
        userId = zoneMatch[1].trim();
        zoneId = zoneMatch[2].trim();
      }

      let detectedName = "ID Verificado";
      
      if (!gameId || gameId.includes('free_fire') || gameId.includes('free-fire') || gameId.toLowerCase() === 'free_fire') {
        try {
          console.log(\`[FreeFireAPI] Fetching profile for UID: \${userId}\`);
          const profile = await ffApi.getPlayerProfile(userId);
          if (profile && profile.basicinfo && profile.basicinfo.nickname) {
             detectedName = profile.basicinfo.nickname;
             console.log(\`[FreeFireAPI] Found nickname: \${detectedName}\`);
          } else {
             console.warn(\`[FreeFireAPI] Profile found but no nickname for UID: \${userId}\`);
             return res.status(404).json({ error: 'Jugador de Free Fire no encontrado. Verifica el ID.' });
          }
        } catch (ffErr) {
          console.error(\`[FreeFireAPI] Failed to fetch profile for UID: \${userId}\`, ffErr);
          return res.status(404).json({ error: 'Jugador de Free Fire no encontrado. Verifica el ID.' });
        }
      }

      return res.json({ name: detectedName, userId: playerId, success: true });
    } catch (error: any) {
      console.error('Error validating player:', error);
      res.status(500).json({ error: error.message || 'Failed to validate player' });
    }
  });

  app.get('/api/assax/catalog'`;

code = code.replace(targetRegex, replacement);
fs.writeFileSync('server.ts', code);
console.log('Fixed validate route again');
