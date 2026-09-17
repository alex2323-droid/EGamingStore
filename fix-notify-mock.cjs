const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ Automatically purchase from HankGames upon order creation[\s\S]*?let assaxResult = null;\n      if \(process\.env\.ASSAX_API_KEY \|\| true\) \{[\s\S]*?\}\n        \}/;

code = code.replace(regex, "");
fs.writeFileSync('server.ts', code);
console.log('Removed mock from server.ts');
