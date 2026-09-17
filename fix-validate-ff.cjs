const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importFF = "import { FreeFireAPI } from 'ffapis';\nconst ffApi = new FreeFireAPI();\n";

if (!code.includes("from 'ffapis'")) {
  code = importFF + code;
}

const validateTarget = /app\.post\('\/api\/validate-player', async \(req, res\) => \{[\s\S]*?\}\);/g;

const validateReplacement = `app.post('/api/validate-player', async (req, res) => {
    try {
      const { packageId, playerId, gameId } = req.body;
      if (!packageId || !playerId) {
        return res.status(400).json({ error: 'Missing packageId or playerId' });
      }

      const apiKey = process.env.ASSAX_API_KEY || 'loot_9f943d83e91023c51ab2c40ab744afd1';
      
      // Parse player ID and zone ID if provided in format like 123456(1234)
      let userId = playerId || '';
      let zoneId = '';
      const zoneMatch = userId.match(/^(.*?)[(\\\\\\s]+(\\\\\\d+)[)\\\\\\s]*$/);
      if (zoneMatch) {
        userId = zoneMatch[1].trim();
        zoneId = zoneMatch[2].trim();
      }

      let detectedName = "ID Verificado";
      
      // Si el juego parece ser Free Fire, intentamos obtener el nombre usando ffapis
      if (!gameId || gameId.includes('free_fire') || gameId.includes('free-fire') || gameId.toLowerCase() === 'free_fire') {
        try {
          console.log(\`[FreeFireAPI] Fetching profile for UID: \${userId}\`);
          const profile = await ffApi.getPlayerProfile(userId);
          if (profile && profile.basicinfo && profile.basicinfo.nickname) {
             detectedName = profile.basicinfo.nickname;
             console.log(\`[FreeFireAPI] Found nickname: \${detectedName}\`);
          } else {
             console.warn(\`[FreeFireAPI] Profile found but no nickname for UID: \${userId}\`);
          }
        } catch (ffErr) {
          console.error(\`[FreeFireAPI] Failed to fetch profile for UID: \${userId}\`, ffErr);
          // If we can't find it, we just keep "ID Verificado" or return an error?
          // Since the user wants to ensure security, maybe we shouldn't block the checkout if the API is down,
          // but we can at least try. Let's let it pass with "ID Verificado" on failure so it doesn't break the store,
          // OR we can return 404 to be strict.
          // The prompt says "quiero que la validacion muestre el nombre del jugador... para tener mayor seguridad"
          // Let's return error if we couldn't find the player in FF!
          return res.status(404).json({ error: 'Jugador de Free Fire no encontrado. Verifica el ID.' });
        }
      }

      return res.json({ name: detectedName, userId: playerId, success: true });
    } catch (error: any) {
      console.error('Error validating player:', error);
      res.status(500).json({ error: error.message || 'Failed to validate player' });
    }
  });`;

code = code.replace(validateTarget, validateReplacement);
fs.writeFileSync('server.ts', code);
console.log('Fixed validate logic with FreeFire API');
