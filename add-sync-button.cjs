const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetHeader = `<div className="bg-surface-elevated p-4 border-b border-glass-border">
              <h3 className="font-bold text-on-surface uppercase text-sm tracking-wider">
                Juegos Disponibles
              </h3>
            </div>`;

const newHeader = `<div className="bg-surface-elevated p-4 border-b border-glass-border flex justify-between items-center">
              <h3 className="font-bold text-on-surface uppercase text-sm tracking-wider">
                Juegos
              </h3>
              <button
                onClick={async () => {
                  try {
                    const btn = document.getElementById('sync-assax-btn');
                    if (btn) btn.innerHTML = '<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>';
                    
                    const res = await fetch('/api/assax/catalog');
                    const data = await res.json();
                    
                    if (data.success && data.data) {
                      const apiGames = data.data;
                      const newGames = [...localGames];
                      
                      let added = 0;
                      let updated = 0;
                      
                      apiGames.forEach((apiGame) => {
                        // Find existing game by ID or Name
                        const existingIdx = newGames.findIndex(g => g.id === apiGame.productId || g.name.toLowerCase() === apiGame.name.toLowerCase());
                        
                        const packages = apiGame.packages.map(p => ({
                          id: p.packageId,
                          amount: parseFloat(p.name.replace(/[^0-9.]/g, '')) || 0,
                          currency: p.name.replace(/[0-9.]/g, '').trim() || 'Coins',
                          price: p.price,
                          iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png'
                        }));

                        if (existingIdx >= 0) {
                          // Update packages
                          newGames[existingIdx].packages = packages;
                          updated++;
                        } else {
                          // Create new game
                          newGames.push({
                            id: apiGame.productId,
                            name: apiGame.name,
                            publisher: 'Assax',
                            bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
                            cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
                            currencyName: 'Coins',
                            category: 'mobile',
                            packages: packages
                          });
                          added++;
                        }
                      });
                      
                      setLocalGames(newGames);
                      if (onUpdateGames) {
                         await onUpdateGames(newGames);
                      }
                      alert('Sincronización exitosa. Actualizados: ' + updated + ', Nuevos: ' + added);
                    } else {
                      alert(data.error || 'Failed to fetch catalog from Assax');
                    }
                  } catch (e) {
                    console.error(e);
                    alert('Error: ' + e.message);
                  } finally {
                    const btn = document.getElementById('sync-assax-btn');
                    if (btn) btn.innerHTML = 'Sync API';
                  }
                }}
                id="sync-assax-btn"
                className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                title="Sincronizar precios y paquetes desde Assax Store"
              >
                Sync API
              </button>
            </div>`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, newHeader);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log('Successfully injected sync button');
} else {
  console.log('Failed to find targetHeader in AdminPanel.tsx');
}

