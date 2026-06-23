import React, { useState } from 'react';
import { Game, GamePackage } from '../types';
import { Save, Plus, Trash2, Edit2, Gamepad2, X, Check } from 'lucide-react';

interface Props {
  games: Game[];
  onUpdateGames: (games: Game[]) => Promise<boolean> | void;
}

export default function AdminPanel({ games, onUpdateGames }: Props) {
  const [localGames, setLocalGames] = useState<Game[]>(JSON.parse(JSON.stringify(games)));
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  const selectedGame = localGames.find(g => g.id === selectedGameId);

  const handlePackageChange = (packageId: string, field: keyof GamePackage, value: any) => {
    if (!selectedGameId) return;
    setLocalGames(prevGames => prevGames.map(game => {
      if (game.id === selectedGameId) {
        return {
          ...game,
          packages: game.packages.map(pkg => 
            pkg.id === packageId ? { ...pkg, [field]: value } : pkg
          )
        };
      }
      return game;
    }));
  };

  const handleGameChange = (field: keyof Game, value: any) => {
    if (!selectedGameId) return;
    setLocalGames(prevGames => prevGames.map(game => {
      if (game.id === selectedGameId) {
        return { ...game, [field]: value };
      }
      return game;
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerUrl' | 'cardUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleGameChange(field, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePackageImageUpload = (e: React.ChangeEvent<HTMLInputElement>, packageId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handlePackageChange(packageId, 'iconUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePackage = (packageId: string) => {
    if (!selectedGameId) return;
    setLocalGames(prevGames => prevGames.map(game => {
      if (game.id === selectedGameId) {
        return {
          ...game,
          packages: game.packages.filter(pkg => pkg.id !== packageId)
        };
      }
      return game;
    }));
  };

  const handleAddPackage = () => {
    if (!selectedGame) return;
    const newPackage: GamePackage = {
      id: `pkg_${Date.now()}`,
      amount: 100,
      currency: selectedGame.currencyName,
      price: 1.00,
      iconUrl: selectedGame.packages[0]?.iconUrl || ''
    };
    
    setLocalGames(prevGames => prevGames.map(game => {
      if (game.id === selectedGame.id) {
        return {
          ...game,
          packages: [...game.packages, newPackage]
        };
      }
      return game;
    }));
  };

  const handleAddGame = () => {
    const newGame: Game = {
      id: `game_${Date.now()}`,
      name: 'Nuevo Juego',
      publisher: '',
      category: 'mobile',
      currencyName: 'Monedas',
      bannerUrl: '',
      cardUrl: '',
      packages: []
    };
    setLocalGames(prev => [...prev, newGame]);
    setSelectedGameId(newGame.id);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteGame = () => {
    if (!selectedGameId) return;
    setShowDeleteModal(true);
  };
  
  const confirmDeleteGame = () => {
    setLocalGames(prev => prev.filter(game => game.id !== selectedGameId));
    setSelectedGameId(null);
    setShowDeleteModal(false);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    const res = await onUpdateGames(localGames);
    if (res !== false) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } else {
      setErrorMessage('Error al guardar. Verifica los permisos.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in relative">
      {/* Toast Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-green-500/20 rounded-full p-1">
            <Check size={16} />
          </div>
          <span className="font-medium font-display tracking-tight">Cambios guardados con éxito</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/20 rounded-full p-1">
            <X size={16} />
          </div>
          <span className="font-medium font-display tracking-tight">{errorMessage}</span>
        </div>
      )}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p className="text-on-surface-variant font-medium">Gestiona los precios y cantidades de los juegos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game List */}
        <div className="col-span-1 border border-glass-border rounded-xl bg-surface-container overflow-hidden h-[fit-content]">
          <div className="bg-surface-elevated p-4 border-b border-glass-border">
            <h3 className="font-bold text-white uppercase text-sm tracking-wider">Juegos Disponibles</h3>
          </div>
          <div className="flex flex-col max-h-[60vh] overflow-y-auto">
            {localGames.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className={`p-4 text-left border-b border-glass-border transition-colors flex items-center gap-3 ${
                  selectedGameId === game.id 
                    ? 'bg-primary/20 border-l-4 border-l-primary' 
                    : 'hover:bg-surface-elevated border-l-4 border-l-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-surface items-center justify-center flex border border-glass-border">
                  {game.cardUrl ? <img src={game.cardUrl} alt={game.name} className="w-full h-full object-cover" /> : <Gamepad2 size={20} className="text-on-surface-variant" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{game.name}</h4>
                  <p className="text-xs text-on-surface-variant">{game.packages.length} paquetes</p>
                </div>
              </button>
            ))}
            <button
              onClick={handleAddGame}
              className="p-4 w-full flex items-center justify-center gap-2 text-primary hover:bg-surface-elevated transition-colors font-bold text-sm"
            >
               <Plus size={16} /> Agregar Juego
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="col-span-1 lg:col-span-3">
          {selectedGame ? (
            <div className="bg-surface-container border border-glass-border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                    <img src={selectedGame.cardUrl || undefined} alt={selectedGame.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit2 size={16} className="text-white" />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cardUrl')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-xl md:text-2xl font-bold text-white">{selectedGame.name}</h2>
                    <p className="text-sm text-primary uppercase tracking-widest font-bold">Moneda: {selectedGame.currencyName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              <div className="mb-6 bg-surface-elevated p-4 rounded-xl border border-glass-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white text-sm">Información del Juego</h3>
                  <button 
                    onClick={handleDeleteGame}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Eliminar Juego
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={selectedGame.name}
                      onChange={(e) => handleGameChange('name', e.target.value)}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Nombre de la moneda</label>
                    <input 
                      type="text" 
                      value={selectedGame.currencyName}
                      onChange={(e) => handleGameChange('currencyName', e.target.value)}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-surface-elevated p-4 rounded-xl border border-glass-border">
                <h3 className="font-bold text-white text-sm mb-4">Imágenes del Juego</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Banner (Portada)</label>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer w-full">
                      {selectedGame.bannerUrl ? (
                        <img src={selectedGame.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Sin banner</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-primary px-3 py-1.5 rounded text-white text-xs font-bold flex items-center gap-2">
                          <Edit2 size={14} /> Cambiar Banner
                        </span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'bannerUrl')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 mt-2">URL del Banner</label>
                      <input 
                        type="text" 
                        value={selectedGame.bannerUrl || ''}
                        placeholder="https://ejemplo.com/banner.png"
                        onChange={(e) => handleGameChange('bannerUrl', e.target.value)}
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Card (Miniatura)</label>
                    <div className="relative aspect-[3/4] max-w-[150px] rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer">
                      {selectedGame.cardUrl ? (
                        <img src={selectedGame.cardUrl} alt="Card" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Sin card</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-primary px-3 py-1.5 rounded text-white text-xs font-bold flex items-center gap-2">
                          <Edit2 size={14} /> Cambiar
                        </span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cardUrl')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 mt-2">URL de la Miniatura</label>
                      <input 
                        type="text" 
                        value={selectedGame.cardUrl || ''}
                        placeholder="https://ejemplo.com/card.png"
                        onChange={(e) => handleGameChange('cardUrl', e.target.value)}
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedGame.packages.map((pkg, index) => (
                  <div key={pkg.id} className="bg-surface-elevated p-4 rounded-xl border border-glass-border flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto font-bold text-on-surface-variant shrink-0">
                      <span className="w-6 h-6 flex items-center justify-center bg-surface rounded-full text-xs">{index + 1}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Cantidad ({pkg.currency})</label>
                        <input 
                          type="number" 
                          value={pkg.amount}
                          onChange={(e) => handlePackageChange(pkg.id, 'amount', Number(e.target.value))}
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Precio (Bs)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => handlePackageChange(pkg.id, 'price', Number(e.target.value))}
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Bonus (Opcional)</label>
                        <input 
                          type="number" 
                          value={pkg.bonus || ''}
                          placeholder="0"
                          onChange={(e) => handlePackageChange(pkg.id, 'bonus', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="w-full mt-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer shrink-0 p-1 flex items-center justify-center">
                        {pkg.iconUrl ? (
                          <img src={pkg.iconUrl} alt="Icono" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-center text-on-surface-variant leading-tight">Sin icono</span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Edit2 size={16} className="text-white" />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handlePackageImageUpload(e, pkg.id)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">URL (O subir imagen)</label>
                        <input 
                          type="text" 
                          value={pkg.iconUrl}
                          placeholder="https://ejemplo.com/icono.png"
                          onChange={(e) => handlePackageChange(pkg.id, 'iconUrl', e.target.value)}
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-2.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg shrink-0 transition-colors w-full md:w-auto flex justify-center mt-2 md:mt-0"
                      title="Eliminar paquete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={handleAddPackage}
                  className="w-full border-2 border-dashed border-glass-border rounded-xl py-4 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors gap-2 font-bold"
                >
                  <Plus size={24} />
                  Añadir Nuevo Paquete
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-surface-container border border-glass-border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
              <Gamepad2 size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Selecciona un juego</h3>
              <p>Elige un juego de la lista para editar sus paquetes y precios.</p>
            </div>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container border border-glass-border rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Juego?</h3>
            <p className="text-on-surface-variant font-medium text-sm mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los paquetes asociados a este juego.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-surface border border-glass-border text-white hover:bg-surface-elevated transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteGame}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
