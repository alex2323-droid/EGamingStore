const fs = require('fs');
const mjsPath = 'node_modules/ffapis/dist/index.mjs';
const jsPath = 'node_modules/ffapis/dist/index.js';

fs.writeFileSync(mjsPath, `
import pkg from './index.js';
export const FreeFireAPI = pkg.FreeFireAPI;
export default pkg;
`);

console.log('Fixed ffapis mjs');
