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

  const verificationCodes = new Map<string, { code: string, expires: number }>();

  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ limit: '200mb', extended: true }));

  app.post('/api/send-verification', async (req, res) => {
    try {
      const { email } = req.body;
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
      verificationCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });
      
      const mailOptions = {
        from: '"Egaming Store" <' + EMAIL_USER + '>',
        to: email,
        subject: 'Código de Verificación - Egaming Store',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #27272a;">
            <div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; color: #3b82f6; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">E Gaming Store</h1>
            </div>
            <div style="padding: 32px 24px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 22px;">Verifica tu correo electrónico</h2>
              <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px;">Usa el siguiente código para completar tu registro:</p>
              
              <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px dashed #3b82f6; display: inline-block;">
                <h3 style="margin: 0; color: #3b82f6; font-size: 32px; letter-spacing: 4px;">${code}</h3>
              </div>
              
              <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-align: center; line-height: 1.5;">
                Este código expirará en 10 minutos.<br>
                Si no solicitaste este código, puedes ignorar este correo.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Verification code sent' });
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  });

  app.post('/api/verify-code', (req, res) => {
    const { email, code } = req.body;
    const record = verificationCodes.get(email);
    
    if (record && record.code === code) {
      if (record.expires > Date.now()) {
        verificationCodes.delete(email);
        res.json({ success: true, message: 'Code verified successfully' });
      } else {
        verificationCodes.delete(email);
        res.status(400).json({ error: 'El código ha expirado' });
      }
    } else {
      res.status(400).json({ error: 'Código inválido' });
    }
  });

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
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; color: #f97316; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">E Gaming Store</h1>
            </div>
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                 <div style="display: inline-block; background-color: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                   <span style="font-size: 32px;">🔔</span>
                 </div>
                 <h2 style="margin: 0 0 8px 0; color: #3b82f6; font-size: 22px;">Nueva Orden Recibida</h2>
                 <p style="margin: 0; color: #a1a1aa; font-size: 16px;">Se requiere revisión y aprobación en el panel.</p>
              </div>
              
              <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
                <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Detalles de la Orden</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">ID de Orden</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; font-family: monospace;">${order.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Cliente</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Juego</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.gameName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Paquete</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; color: #f97316;">${order.packageName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Precio</td>
                    <td style="padding: 8px 0; color: #10b981; font-size: 14px; text-align: right; font-weight: 700;">Bs ${order.price.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Método de Pago</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Referencia</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; font-family: monospace;">${order.referenceNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Player ID</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.playerId || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Fecha</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right;">${new Date(order.date).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>
            <div style="background-color: #09090b; padding: 16px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} E Gaming Store.</p>
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
      let html = '';
      
      if (status === 'completed') {
        subject = `Recarga Completada Exitosamente - ${order.gameName}`;
        text = `Hola,\n\nTu recarga ha sido procesada y completada con éxito.\n\nDetalles de la orden:\n- ID de Orden: ${order.id}\n- Juego: ${order.gameName}\n- Paquete: ${order.packageName}\n- Player ID: ${order.playerId || 'N/A'}\n- Fecha de Orden: ${new Date(order.date).toLocaleString()}\n\n¡Gracias por tu compra en Egaming Store!\n`;
        html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #27272a;">
            <div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; color: #f97316; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">E Gaming Store</h1>
            </div>
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                 <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                   <span style="font-size: 32px;">✅</span>
                 </div>
                 <h2 style="margin: 0 0 8px 0; color: #10b981; font-size: 22px;">¡Recarga Completada!</h2>
                 <p style="margin: 0; color: #a1a1aa; font-size: 16px;">Tu recarga ha sido procesada exitosamente.</p>
              </div>
              
              <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
                <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Detalles de la Orden</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">ID de Orden</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; font-family: monospace;">${order.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Juego</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.gameName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Paquete</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; color: #f97316;">${order.packageName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Player ID</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.playerId || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Fecha</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right;">${new Date(order.date).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-align: center; line-height: 1.5;">
                Si tienes alguna duda o problema con tu recarga, contacta a nuestro equipo de soporte.<br><br>
                <strong style="color: #f8fafc;">¡Gracias por preferir Egaming Store!</strong>
              </p>
            </div>
            <div style="background-color: #09090b; padding: 16px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} E Gaming Store. Todos los derechos reservados.</p>
            </div>
          </div>
        `;
      } else if (status === 'rejected') {
        subject = `Recarga Rechazada - ${order.gameName}`;
        text = `Hola,\n\nLamentamos informarte que tu recarga ha sido rechazada.\n\nDetalles de la orden:\n- ID de Orden: ${order.id}\n- Juego: ${order.gameName}\n- Paquete: ${order.packageName}\n- Fecha de Orden: ${new Date(order.date).toLocaleString()}\n\nPor favor, contacta a soporte para más detalles.\n`;
        html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #27272a;">
            <div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; color: #f97316; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">E Gaming Store</h1>
            </div>
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                 <div style="display: inline-block; background-color: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                   <span style="font-size: 32px;">❌</span>
                 </div>
                 <h2 style="margin: 0 0 8px 0; color: #ef4444; font-size: 22px;">Recarga Rechazada</h2>
                 <p style="margin: 0; color: #a1a1aa; font-size: 16px;">Lamentamos informarte que tu orden ha sido rechazada.</p>
              </div>
              
              <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
                <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Detalles de la Orden</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">ID de Orden</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; font-family: monospace;">${order.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Juego</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.gameName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Paquete</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600; color: #f97316;">${order.packageName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Player ID</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right; font-weight: 600;">${order.playerId || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Fecha</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; text-align: right;">${new Date(order.date).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-align: center; line-height: 1.5;">
                Por favor, contacta a nuestro equipo de soporte para obtener más detalles sobre el motivo del rechazo y cómo solucionarlo.<br><br>
              </p>
            </div>
            <div style="background-color: #09090b; padding: 16px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} E Gaming Store. Todos los derechos reservados.</p>
            </div>
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
