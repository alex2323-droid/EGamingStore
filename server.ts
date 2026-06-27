import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMAIL_USER = process.env.GMAIL_USER || 'EgamingStore1@gmail.com';
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'hlbhebihoihlewcf';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
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
      
      const admins = ['EgamingStore1@gmail.com', 'alexparababi23@gmail.com', 'avila2004alexparababi@gmail.com'];
      
      const mailOptions = {
        from: '"Egaming Store" <' + EMAIL_USER + '>',
        to: admins.join(', '),
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
- Player ID: ${order.playerId || 'N/A'}
`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">Nueva Recarga Registrada</h2>
            <p>Se ha registrado una nueva recarga en el sistema.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Detalles de la orden:</h3>
              <ul style="list-style-type: none; padding-left: 0; color: #4b5563;">
                <li style="margin-bottom: 8px;"><strong>ID de Orden:</strong> ${order.id}</li>
                <li style="margin-bottom: 8px;"><strong>Juego:</strong> ${order.gameName}</li>
                <li style="margin-bottom: 8px;"><strong>Paquete:</strong> ${order.packageName}</li>
                <li style="margin-bottom: 8px;"><strong>Precio:</strong> Bs ${order.price.toFixed(2)}</li>
                <li style="margin-bottom: 8px;"><strong>Método de Pago:</strong> ${order.paymentMethod}</li>
                <li style="margin-bottom: 8px;"><strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}</li>
                <li style="margin-bottom: 8px;"><strong>Email del Cliente:</strong> ${customerEmail}</li>
                <li style="margin-bottom: 8px;"><strong>Player ID:</strong> ${order.playerId || 'N/A'}</li>
              </ul>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('Error sending email notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  app.post('/api/notify-order-status', async (req, res) => {
    try {
      const { order, customerEmail, status } = req.body;
      
      let subject = '';
      let text = '';
      
      if (status === 'completed') {
        subject = `Recarga Completada Exitosamente - ${order.gameName}`;
        text = `Hola,\n\nTu recarga ha sido procesada y completada con éxito.\n\nDetalles de la orden:\n- ID de Orden: ${order.id}\n- Juego: ${order.gameName}\n- Paquete: ${order.packageName}\n- Player ID: ${order.playerId || 'N/A'}\n- Fecha de Orden: ${new Date(order.date).toLocaleString()}\n\n¡Gracias por tu compra en Egaming Store!\n`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #10b981; margin-bottom: 20px;">¡Recarga Completada Exitosamente!</h2>
            <p>Hola,</p>
            <p>Tu recarga ha sido procesada y completada con éxito.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Detalles de la orden:</h3>
              <ul style="list-style-type: none; padding-left: 0; color: #4b5563;">
                <li style="margin-bottom: 8px;"><strong>ID de Orden:</strong> ${order.id}</li>
                <li style="margin-bottom: 8px;"><strong>Juego:</strong> ${order.gameName}</li>
                <li style="margin-bottom: 8px;"><strong>Paquete:</strong> ${order.packageName}</li>
                <li style="margin-bottom: 8px;"><strong>Player ID:</strong> ${order.playerId || 'N/A'}</li>
                <li style="margin-bottom: 8px;"><strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 0.9em;">¡Gracias por tu compra en Egaming Store!</p>
          </div>
        `;
      } else if (status === 'rejected') {
        subject = `Recarga Rechazada - ${order.gameName}`;
        text = `Hola,\n\nLamentamos informarte que tu recarga ha sido rechazada.\n\nDetalles de la orden:\n- ID de Orden: ${order.id}\n- Juego: ${order.gameName}\n- Paquete: ${order.packageName}\n- Fecha de Orden: ${new Date(order.date).toLocaleString()}\n\nPor favor, contacta a soporte para más detalles.\n`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-bottom: 20px;">Recarga Rechazada</h2>
            <p>Hola,</p>
            <p>Lamentamos informarte que tu recarga ha sido rechazada.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Detalles de la orden:</h3>
              <ul style="list-style-type: none; padding-left: 0; color: #4b5563;">
                <li style="margin-bottom: 8px;"><strong>ID de Orden:</strong> ${order.id}</li>
                <li style="margin-bottom: 8px;"><strong>Juego:</strong> ${order.gameName}</li>
                <li style="margin-bottom: 8px;"><strong>Paquete:</strong> ${order.packageName}</li>
                <li style="margin-bottom: 8px;"><strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 0.9em;">Por favor, contacta a soporte para más detalles.</p>
          </div>
        `;
      } else {
        return res.json({ success: true, message: 'Status does not require notification' });
      }

      const mailOptions = {
        from: '"Egaming Store" <' + EMAIL_USER + '>',
        to: customerEmail,
        subject,
        text,
        html,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('Error sending order status email notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  app.post('/api/auto-fix', async (req, res) => {
    try {
      const { errors } = req.body;
      if (!errors || errors.length === 0) {
        return res.json({ success: true, message: 'No errors to fix' });
      }

      console.log('Received errors for auto-fix:', errors);
      
      const prompt = `Se han detectado los siguientes errores en la aplicación web: \n\n${JSON.stringify(errors, null, 2)}\n\nPor favor, genera un análisis de la causa raíz. Si es posible solucionarlo sin contexto de archivos, proporciona sugerencias. Si necesitas más archivos, indícalo. Como soy un sistema automatizado, solo puedo registrar el análisis, no modificar archivos directamente desde aquí.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      console.log('Gemini AI Analysis:', response.text);

      res.json({ success: true, message: 'Errors processed', analysis: response.text });
    } catch (error) {
      console.error('Error in auto-fix:', error);
      res.status(500).json({ error: 'Failed to process auto-fix' });
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
