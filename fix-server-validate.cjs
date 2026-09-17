const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const validateTarget = /const \{ packageId, playerId, gameId \} = req\.body;[\s\S]*?if \(!gameId \|\| gameId\.includes\('free_fire'\) \|\| gameId\.includes\('free-fire'\) \|\| gameId\.toLowerCase\(\) === 'free_fire'\) \{/;

const replacement = `const { packageId, playerId, gameId, gameName } = req.body;
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
      
      const isFreeFire = (gameId && gameId.toLowerCase().includes('free-fire')) || 
                         (gameId && gameId.toLowerCase().includes('free_fire')) ||
                         (gameName && gameName.toLowerCase().includes('free fire')) ||
                         (gameName && gameName.toLowerCase().includes('freefire')) ||
                         (!gameId && !gameName); // Fallback if old frontend

      if (isFreeFire) {`;

code = code.replace(validateTarget, replacement);
fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts validation to check gameName');
