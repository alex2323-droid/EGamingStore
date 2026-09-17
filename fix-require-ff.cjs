const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`import { createRequire } from 'module';
const customRequire = createRequire(import.meta.url);
const ffapis = customRequire('ffapis');
const FreeFireAPI = ffapis.FreeFireAPI;`, "import { FreeFireAPI } from 'ffapis';");

fs.writeFileSync('server.ts', code);
console.log('Fixed ffapis import back to normal');
