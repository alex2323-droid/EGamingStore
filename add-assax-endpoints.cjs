const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const webhookIndex = code.indexOf("app.post('/api/hankgames/webhook'");
if (webhookIndex !== -1) {
  const newEndpoints = `
  app.get('/api/assax/catalog', async (req, res) => {
    try {
      if (!process.env.ASSAX_API_KEY) {
        return res.status(400).json({ error: 'ASSAX_API_KEY no está configurada' });
      }
      const response = await fetch('https://assaxstore.com/api/reseller/catalog', {
        headers: { 'X-API-Key': process.env.ASSAX_API_KEY }
      });
      if (!response.ok) throw new Error('Failed to fetch catalog');
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching Assax catalog:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/assax/balance', async (req, res) => {
    try {
      if (!process.env.ASSAX_API_KEY) {
        return res.status(400).json({ error: 'ASSAX_API_KEY no está configurada' });
      }
      const response = await fetch('https://assaxstore.com/api/reseller/balance', {
        headers: { 'X-API-Key': process.env.ASSAX_API_KEY }
      });
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching Assax balance:', error);
      res.status(500).json({ error: error.message });
    }
  });

  `;
  
  code = code.substring(0, webhookIndex) + newEndpoints + code.substring(webhookIndex);
  fs.writeFileSync('server.ts', code);
  console.log('Added /api/assax/catalog and /api/assax/balance');
}

