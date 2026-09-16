const fs = require('fs');

let envEx = fs.readFileSync('.env.example', 'utf8');
envEx = envEx.replace(
  '# HANKGAMES_API_USER: Usuario o email para la API de HankGames (Get Token)\nHANKGAMES_API_USER=""\n\n# HANKGAMES_API_PASS: Contraseña o Client Secret para la API de HankGames\nHANKGAMES_API_PASS=""',
  '# ASSAX_API_KEY: Clave API del proveedor Assax Store\nASSAX_API_KEY=""'
);
fs.writeFileSync('.env.example', envEx);
console.log('.env.example updated');
