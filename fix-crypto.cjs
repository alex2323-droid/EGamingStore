const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

if (code.includes("const crypto = require('crypto');")) {
  code = code.replace("const crypto = require('crypto');", "");
  code = "import crypto from 'crypto';\n" + code;
  fs.writeFileSync('server.ts', code);
  console.log('Fixed crypto import for ESM');
}

