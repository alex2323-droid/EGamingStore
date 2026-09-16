const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const oldWebhookStart = "app.post('/api/hankgames/webhook', express.json(), async (req, res) => {";
const oldWebhookIndex = code.indexOf(oldWebhookStart);

if (oldWebhookIndex !== -1) {
  const oldWebhookEnd = code.indexOf("});", oldWebhookIndex + oldWebhookStart.length) + 3;
  
  const before = code.substring(0, oldWebhookIndex);
  const after = code.substring(oldWebhookEnd);
  
  const newWebhook = `const crypto = require('crypto');
  
  app.post('/api/assax/webhook', express.json({ verify: (req, res, buf) => { (req as any).rawBody = buf; } }), async (req, res) => {
    try {
      console.log('--- ASSAX WEBHOOK RECEIVED ---');
      const signature = req.headers['x-webhook-signature'] as string;
      const secret = process.env.ASSAX_WEBHOOK_SECRET;
      
      if (secret && signature && (req as any).rawBody) {
        const expected = crypto.createHmac('sha256', secret).update((req as any).rawBody).digest('hex');
        if (signature !== expected) {
          console.error('Invalid Assax Webhook signature');
          return res.status(401).send('Invalid signature');
        }
      }

      const { event, data } = req.body;
      console.log('Event:', event);
      console.log('Data:', data);
      
      if (event === 'order.completed') {
        console.log('Order completed:', data.orderId, 'Code:', data.deliveredCode);
        // Here you would typically update the order status in Firebase
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });`;
  
  code = before + newWebhook + after;
  fs.writeFileSync('server.ts', code);
  console.log('Fixed Webhook endpoint');
}

