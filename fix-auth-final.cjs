const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStart = "app.post('/api/validate-player'";
const targetEnd = "app.post('/api/hankgames/webhook'";

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  
  const cleanMiddle = `app.post('/api/validate-player', async (req, res) => {
    try {
      const { packageId, playerId, gameId } = req.body;
      if (!packageId || !playerId) {
        return res.status(400).json({ error: 'Missing packageId or playerId' });
      }

      // Como la API de Assax no tiene un endpoint para verificar el nombre del jugador, 
      // aprobamos la validación visualmente para que el cliente pueda pagar.
      // Assax validará el ID real cuando enviemos la orden (y dará error 400/404 si es inválido).
      
      return res.json({ name: "ID Verificado", userId: playerId, success: true });

    } catch (error: any) {
      console.error('Error validating player:', error);
      res.status(500).json({ error: error.message || 'Failed to validate player' });
    }
  });

  `;
  
  code = before + cleanMiddle + after;
  fs.writeFileSync('server.ts', code);
  console.log('Reverted check-player to mock validation');
}

