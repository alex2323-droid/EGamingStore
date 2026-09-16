const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const rateCode = `
          <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border mb-6">
            <h3 className="font-bold text-on-surface mb-4">Tasa de Cambio (VES/USD)</h3>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Tasa Manual (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={localSettings.exchangeRate || ''}
                  onChange={(e) => handleSettingsChange("exchangeRate", parseFloat(e.target.value))}
                  disabled={localSettings.useAutomaticBcvRate}
                  className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="Ej: 36.50"
                />
              </div>
              <div className="flex-1 w-full flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.useAutomaticBcvRate || false}
                    onChange={(e) => handleSettingsChange("useAutomaticBcvRate", e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Usar Tasa BCV Automática (DolarAPI)
                  </span>
                </label>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('https://ve.dolarapi.com/v1/dolares');
                    const data = await res.json();
                    const bcv = data.find((d: any) => d.fuente === 'oficial');
                    if (bcv && bcv.promedio) {
                      handleSettingsChange("exchangeRate", bcv.promedio);
                      alert('Tasa BCV actualizada: ' + bcv.promedio);
                    } else {
                      alert('No se pudo obtener la tasa BCV');
                    }
                  } catch (e) {
                    alert('Error obteniendo tasa BCV');
                  }
                }}
                className="btn-secondary py-2 px-4 rounded-lg font-bold text-sm h-10"
              >
                Obtener Tasa BCV Actual
              </button>
            </div>
          </div>
`;

code = code.replace(
  '<div className="space-y-6">\n            {(localSettings.paymentMethods',
  rateCode + '\n          <div className="space-y-6">\n            {(localSettings.paymentMethods'
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Done');
