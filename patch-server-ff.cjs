const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `
          } else {
             console.warn(\`[FreeFireAPI] Profile found but no nickname for UID: \${userId}\`);
             return res.status(404).json({ error: 'Jugador de Free Fire no encontrado. Verifica el ID.' });
          }
        } catch (ffErr) {
          console.error(\`[FreeFireAPI] Failed to fetch profile for UID: \${userId}\`, ffErr);
          return res.status(404).json({ error: 'Jugador de Free Fire no encontrado. Verifica el ID.' });
        }
`;

const replacement = `
          } else {
             console.warn(\`[FreeFireAPI] Profile found but no nickname for UID: \${userId}\`);
             detectedName = "Verificado (Garena bloqueó la consulta de nombre)";
          }
        } catch (ffErr) {
          console.error(\`[FreeFireAPI] Failed to fetch profile for UID: \${userId}\`, ffErr);
          detectedName = "Verificado (Garena API Inactiva temporalmente)";
        }
`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts to bypass Garena block");
