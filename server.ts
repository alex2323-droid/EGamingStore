import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';

const EMAIL_USER = 'EgamingStore1@gmail.com';
const EMAIL_PASS = 'hlbh ebih oihl ewcf';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const DB_FILE = path.join(process.cwd(), 'games-db.json');

// Initialize DB with defaults if needed
async function getGamesDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If doesn't exist, we fallback to default list but we need to supply it somehow.
    // For now, let's just return empty and let client seed it or we can import from data.js
    return null;
  }
}

async function saveGamesDb(games: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(games, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ limit: '200mb', extended: true }));

  app.get('/api/games', async (req, res) => {
    try {
      const games = await getGamesDb();
      if (!games) {
        res.status(404).json({ error: 'Not initialized' });
        return;
      }
      res.json(games);
    } catch(err) {
      res.status(500).json({ error: 'Failed to read db' });
    }
  });

  app.post('/api/games', async (req, res) => {
    try {
      // Security check in a real app would be done via tokens, we assume the frontend sends the user's email if needed or we trust the container for now
      const { games, adminEmail } = req.body;
      const admins = ['EgamingStore1@gmail.com', 'alexparababi23@gmail.com', 'avila2004alexparababi@gmail.com'];
      if (!admins.includes(adminEmail)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await saveGamesDb(games);
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: 'Failed to write db' });
    }
  });

  app.post('/api/notify-order', async (req, res) => {
    try {
      const { order, customerEmail } = req.body;
      
      const mailOptions = {
        from: EMAIL_USER,
        to: EMAIL_USER,
        subject: `Nueva Recarga Exitosa - ${order.gameName}`,
        text: `Se ha registrado una nueva recarga.

Detalles de la orden:
- ID de Orden: ${order.id}
- Juego: ${order.gameName}
- Paquete: ${order.packageName}
- Precio: Bs ${order.price.toFixed(2)}
- Método de Pago: ${order.paymentMethod}
- Fecha: ${new Date(order.date).toLocaleString()}
- Email del Cliente: ${customerEmail}
`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('Error sending email notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
