const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');
const oldRegex = "userId.match(/^(.*?)[(\\\\s]+(\\\\d+)[)\\\\s]*$/);";
const newRegex = "userId.match(/^(.*?)[(\\\\s]+([^)]+)[)\\\\s]*$/);";

if (code.includes(oldRegex)) {
  code = code.replace(oldRegex, newRegex);
  fs.writeFileSync('server.ts', code);
  console.log('Fixed regex in server.ts');
} else {
  // Let's try matching without backslash escapes for string literal
  const altOldRegex = "userId.match(/^(.*?)[(\\s]+(\\d+)[)\\s]*$/);";
  const altNewRegex = "userId.match(/^(.*?)[(\\s]+([^)]+)[)\\s]*$/);";
  if (code.includes(altOldRegex)) {
    code = code.replace(altOldRegex, altNewRegex);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed regex in server.ts (alt)');
  } else {
    console.log('Could not find regex to fix');
  }
}
