const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `await transporter.sendMail(mailOptions);\n      res.json({ success: true, message: 'Notification sent' });`,
  `await transporter.sendMail(mailOptions);\n      res.json({ success: true, message: 'Notification sent', assaxResult });`
);

fs.writeFileSync('server.ts', code);
