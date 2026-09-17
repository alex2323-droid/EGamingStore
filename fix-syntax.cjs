const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /  \}\);\n      \}\n\n      \/\/ Validar simplemente que el ID no esté vacío para permitir que el frontend avance\n      return res\.json\(\{ name: "ID Verificado", userId: playerId, success: true \}\);\n\n    \} catch \(error: any\) \{\n      console\.error\('Error validating player:', error\);\n      res\.status\(500\)\.json\(\{ error: error\.message || 'Failed to validate player' \}\);\n    \}\n  \}\);/g;

code = code.replace(regex, "");
fs.writeFileSync('server.ts', code);
console.log('Fixed syntax duplication');
