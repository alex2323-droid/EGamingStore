const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `
                        if (existingIdx >= 0) {
                          // Update packages
                          newGames[existingIdx].packages = packages;
                          updated++;
                        }`;

const replacement = `
                        if (existingIdx >= 0) {
                          // Update packages and ensure ID matches Assax product ID
                          newGames[existingIdx].id = apiGame.productId;
                          newGames[existingIdx].packages = packages;
                          updated++;
                        }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Fixed Assax sync ID assignment');
