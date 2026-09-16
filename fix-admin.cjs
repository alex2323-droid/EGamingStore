const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// I will add a button to check Assax Balance in the overview section.
const overviewTarget = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">';
const overviewIndex = code.indexOf(overviewTarget);

if (overviewIndex !== -1) {
  const insertIndex = overviewIndex + overviewTarget.length;
  const before = code.substring(0, insertIndex);
  const after = code.substring(insertIndex);
  
  const balanceCard = `
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Balance Assax Store</h3>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1" id="assax-balance-display">---</p>
          <button 
            onClick={async () => {
              try {
                const el = document.getElementById('assax-balance-display');
                if (el) el.innerText = 'Cargando...';
                const res = await fetch('/api/assax/balance');
                const data = await res.json();
                if (data.success && data.data) {
                  if (el) el.innerText = data.data.balance + ' ' + data.data.currency;
                } else {
                  if (el) el.innerText = 'Error';
                  alert(data.error || 'Failed to fetch balance');
                }
              } catch (e) {
                const el = document.getElementById('assax-balance-display');
                if (el) el.innerText = 'Error';
                console.error(e);
              }
            }}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2 underline"
          >
            Actualizar saldo
          </button>
        </div>
  `;
  
  code = before + balanceCard + after;
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log('Added balance card to admin panel');
} else {
  console.log('Could not find overview target in admin panel');
}

