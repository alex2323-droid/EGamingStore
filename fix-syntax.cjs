const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const duplicate = `    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });`;

// Remove the duplicated catch block
const lastIndex = code.lastIndexOf(duplicate);
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + code.substring(lastIndex + duplicate.length);
  fs.writeFileSync('server.ts', code);
  console.log('Fixed syntax error');
}

