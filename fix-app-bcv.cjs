const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fetchLogic = `
          if (loadedSettings.useAutomaticBcvRate) {
            try {
              const bcvRes = await fetch('https://ve.dolarapi.com/v1/dolares');
              const bcvData = await bcvRes.json();
              const oficial = bcvData.find((d: any) => d.fuente === 'oficial');
              if (oficial && oficial.promedio) {
                loadedSettings.exchangeRate = oficial.promedio;
              }
            } catch(e) {
              console.error("Failed to fetch BCV rate", e);
            }
          }
          setSiteSettings(loadedSettings);
`;

code = code.replace(
  '          setSiteSettings(loadedSettings);',
  fetchLogic
);

fs.writeFileSync('src/App.tsx', code);
console.log('Done');
