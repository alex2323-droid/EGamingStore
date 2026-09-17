import React, { useState, useEffect, useRef } from "react";
import {
  PromoCode,
  Game,
  GamePackage,
  SiteSettings,
  Order,
  PaymentMethod,
  isGameGiftCard,
} from "../types";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  Gamepad2,
  Gift,
  X,
  Check,
  Tag,
  Settings,
  CreditCard,
  ShoppingCart,
  Eye,
  EyeOff,
  Mail,
  Bitcoin,
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  QrCode,
  ImageIcon,
  Upload,
} from "lucide-react";
import { PAYMENT_METHODS } from "../data";
import EmailComposer from "./EmailComposer";

interface Props {
  games: Game[];
  promoCodes?: PromoCode[];
  siteSettings?: SiteSettings | null;
  orders?: Order[];
  onUpdateGames: (games: Game[]) => Promise<boolean> | void;
  onUpdatePromoCodes?: (codes: PromoCode[]) => Promise<boolean> | void;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean> | void;
  onUpdateOrder?: (
    orderId: string,
    status: "completed" | "pending" | "failed" | "rejected",
  ) => Promise<boolean> | void;
}

export default function AdminPanel({
  games,
  promoCodes = [],
  siteSettings,
  orders = [],
  onUpdateGames,
  onUpdatePromoCodes,
  onUpdateSiteSettings,
  onUpdateOrder,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "games" | "promos" | "settings" | "payments" | "orders" | "emails"
  >("games");
  const [localGames, setLocalGames] = useState<Game[]>(
    JSON.parse(JSON.stringify(games)),
  );
  const [localPromoCodes, setLocalPromoCodes] = useState<PromoCode[]>(
    JSON.parse(JSON.stringify(promoCodes)),
  );

  const defaultSettings: SiteSettings = {
    mascotHomeUrl: "",
    mascotSupportUrl: "",
    mascotLoginUrl: "",
    showMascotHome: true,
    showMascotSupport: true,
    showMascotLogin: true,
    paymentMethods: PAYMENT_METHODS,
    supportPhone: "+584142943532",
    binanceEnabled: false,
    binanceApiKey: "",
    binanceApiSecret: "",
    binanceMerchantId: "",
    binancePayId: "",
    binanceValidationMode: "auto",
  };
  const [localSettings, setLocalSettings] = useState<SiteSettings>(
    siteSettings || defaultSettings,
  );

  const [isTestingBinance, setIsTestingBinance] = useState(false);
  const [binanceTestResult, setBinanceTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    accountType?: string;
    usdtBalance?: string;
    permissions?: string[];
    error?: string;
  } | null>(null);
  const [showBinanceApiKey, setShowBinanceApiKey] = useState(false);
  const [showBinanceSecret, setShowBinanceSecret] = useState(false);

  const handleTestBinanceConnection = async () => {
    setIsTestingBinance(true);
    setBinanceTestResult(null);

    try {
      let apiUrl = import.meta.env.VITE_API_URL || "";
      if (apiUrl.includes("<AQUI")) apiUrl = "";
      apiUrl = apiUrl.replace(/\/+$/, "");

      const res = await fetch(`${apiUrl}/api/binance/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: localSettings.binanceApiKey,
          apiSecret: localSettings.binanceApiSecret,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBinanceTestResult({
          success: true,
          message: data.message || "Conexión exitosa con Binance API",
          latencyMs: data.latencyMs,
          accountType: data.accountType,
          usdtBalance: data.usdtBalance,
          permissions: data.permissions,
        });
      } else {
        setBinanceTestResult({
          success: false,
          message: data.error || "No se pudo autenticar con Binance API.",
          error: data.error,
        });
      }
    } catch (err: any) {
      setBinanceTestResult({
        success: false,
        message: err.message || "Error de red al conectar con el servidor.",
        error: err.message,
      });
    } finally {
      setIsTestingBinance(false);
    }
  };

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const selectedGame = localGames.find((g) => g.id === selectedGameId);

  const handlePackageChange = (
    packageId: string,
    field: keyof GamePackage,
    value: any,
  ) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          return {
            ...game,
            packages: (game.packages || []).map((pkg) =>
              pkg.id === packageId ? { ...pkg, [field]: value } : pkg,
            ),
          };
        }
        return game;
      }),
    );
  };

  const handleGameChange = (field: keyof Game, value: any) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          return { ...game, [field]: value };
        }
        return game;
      }),
    );
  };

  const compressImage = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", 0.6); // 0.6 quality for lower size
        callback(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "bannerUrl" | "cardUrl",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        handleGameChange(field, dataUrl);
      });
    }
  };

  const handlePackageImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    packageId: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        handlePackageChange(packageId, "iconUrl", dataUrl);
      });
    }
  };

  const handleDeletePackage = (packageId: string) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          return {
            ...game,
            packages: (game.packages || []).filter((pkg) => pkg.id !== packageId),
          };
        }
        return game;
      }),
    );
  };

  const handleAddPackage = () => {
    if (!selectedGame) return;
    const newPackage: GamePackage = {
      id: `pkg_${Date.now()}`,
      amount: 100,
      currency: selectedGame.currencyName,
      price: 1.0,
      iconUrl: selectedGame.packages[0]?.iconUrl || "",
    };

    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGame.id) {
          return {
            ...game,
            packages: [...(game.packages || []), newPackage],
          };
        }
        return game;
      }),
    );
  };

  const handleAddGame = () => {
    const newGame: Game = {
      id: `game_${Date.now()}`,
      name: "Nuevo Juego",
      publisher: "",
      category: "mobile",
      isGiftCard: false,
      currencyName: "Monedas",
      bannerUrl: "",
      cardUrl: "",
      packages: [],
    };
    setLocalGames((prev) => [...prev, newGame]);
    setSelectedGameId(newGame.id);
  };

  const handleAddGiftCard = () => {
    const newGiftCard: Game = {
      id: `giftcard_${Date.now()}`,
      name: "Nueva Tarjeta de Regalo",
      publisher: "Digital",
      category: "giftcard",
      isGiftCard: true,
      currencyName: "USD",
      bannerUrl: "",
      cardUrl: "",
      packages: [],
    };
    setLocalGames((prev) => [...prev, newGiftCard]);
    setSelectedGameId(newGiftCard.id);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const handleDeleteGame = () => {
    if (!selectedGameId) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteGame = () => {
    setLocalGames((prev) => prev.filter((game) => game.id !== selectedGameId));
    setSelectedGameId(null);
    setShowDeleteModal(false);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async (isAutoSave: boolean | React.MouseEvent = false) => {
    const autoSave = isAutoSave === true;
    setIsSaving(true);
    setErrorMessage("");
    const resGames = await onUpdateGames(localGames);
    const resPromos = onUpdatePromoCodes
      ? await onUpdatePromoCodes(localPromoCodes)
      : true;
    const resSettings = onUpdateSiteSettings
      ? await onUpdateSiteSettings(localSettings)
      : true;

    if (resGames !== false && resPromos !== false && resSettings !== false) {
      if (!autoSave) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } else {
      setErrorMessage("Error al guardar. Verifica los permisos.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
    setIsSaving(false);
  };

  const handleAddPromoCode = () => {
    const newCode: PromoCode = {
      id: `promo_${Date.now()}`,
      code: "NUEVO_CODIGO",
      discountPercentage: 10,
      active: true,
      usageCount: 0,
    };
    setLocalPromoCodes([...localPromoCodes, newCode]);
  };

  const handlePromoCodeChange = (
    id: string,
    field: keyof PromoCode,
    value: any,
  ) => {
    setLocalPromoCodes((prev) =>
      prev.map((code) => (code.id === id ? { ...code, [field]: value } : code)),
    );
  };

  const handleDeletePromoCode = (id: string) => {
    setLocalPromoCodes((prev) => prev.filter((code) => code.id !== id));
  };

  const handleSettingsChange = (field: keyof SiteSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingsImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SiteSettings,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/webp", 0.8);
          handleSettingsChange(field, dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in relative">
      {/* Toast Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-green-500/20 rounded-full p-1">
            <Check size={16} />
          </div>
          <span className="font-medium font-display tracking-tight">
            Cambios guardados con éxito
          </span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/20 rounded-full p-1">
            <X size={16} />
          </div>
          <span className="font-medium font-display tracking-tight">
            {errorMessage}
          </span>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2">
            Panel de Administración
          </h1>
          <p className="text-on-surface-variant font-medium">
            Gestiona los precios, paquetes y códigos de descuento.
          </p>
        </div>
        <div className="flex bg-surface-elevated rounded-lg p-1 border border-glass-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("games")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "games" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Gamepad2 size={16} className="inline-block mr-2" />
            Juegos
          </button>
          <button
            onClick={() => setActiveTab("promos")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "promos" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Tag size={16} className="inline-block mr-2" />
            Códigos Promo
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "settings" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Settings size={16} className="inline-block mr-2" />
            Config. Web
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "payments" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <CreditCard size={16} className="inline-block mr-2" />
            Métodos de Pago
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "orders" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <ShoppingCart size={16} className="inline-block mr-2" />
            Órdenes
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "emails" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Mail size={16} className="inline-block mr-2" />
            Correos
          </button>
        </div>
      </div>

      {activeTab === "games" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game List */}
          <div className="col-span-1 border border-glass-border rounded-xl bg-surface-container overflow-hidden h-[fit-content]">
            <div className="bg-surface-elevated p-4 border-b border-glass-border flex justify-between items-center">
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
                          // Update packages and ensure ID matches Assax product ID
                          newGames[existingIdx].id = apiGame.productId;
                          newGames[existingIdx].packages = packages;
                          if (newGames[existingIdx].publisher && newGames[existingIdx].publisher.toLowerCase().includes('assax')) {
                            newGames[existingIdx].publisher = '';
                          }
                          updated++;
                        } else {
                          // Create new game
                          newGames.push({
                            id: apiGame.productId,
                            name: apiGame.name,
                            publisher: '',
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
            </div>
            <div className="flex flex-col max-h-[60vh] overflow-y-auto">
              {localGames.map((game, index) => (
                <button
                  key={`${game.id || 'game'}-${index}`}
                  onClick={() => setSelectedGameId(game.id)}
                  className={`p-4 text-left border-b border-glass-border transition-colors flex items-center gap-3 ${
                    selectedGameId === game.id
                      ? "bg-primary/20 border-l-4 border-l-primary"
                      : "hover:bg-surface-elevated border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-surface items-center justify-center flex border border-glass-border">
                    {game.cardUrl ? (
                      <img
                        src={game.cardUrl}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : isGameGiftCard(game) ? (
                      <Gift size={20} className="text-cyan-400" />
                    ) : (
                      <Gamepad2 size={20} className="text-on-surface-variant" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${isGameGiftCard(game) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-primary/20 text-primary'}`}>
                        {isGameGiftCard(game) ? 'Gift Card' : 'Juego'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-on-surface truncate">
                      {game.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {game.packages.length} paquetes
                    </p>
                  </div>
                </button>
              ))}
              <div className="grid grid-cols-2 gap-1 p-2 border-t border-glass-border">
                <button
                  onClick={handleAddGame}
                  className="p-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold text-xs"
                >
                  <Plus size={14} /> + Juego
                </button>
                <button
                  onClick={handleAddGiftCard}
                  className="p-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors font-bold text-xs"
                >
                  <Gift size={14} /> + Gift Card
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="col-span-1 lg:col-span-3">
            {selectedGame ? (
              <div className="bg-surface-container border border-glass-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                      <img
                        src={selectedGame.cardUrl || undefined}
                        alt={selectedGame.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Edit2 size={16} className="text-on-surface" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cardUrl")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                        {selectedGame.name}
                      </h2>
                      <p className="text-sm text-primary uppercase tracking-widest font-bold">
                        Moneda: {selectedGame.currencyName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <Save size={18} />{" "}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>

                <div className="mb-6 bg-surface-elevated p-4 rounded-xl border border-glass-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-on-surface text-sm">
                      Información del Producto
                    </h3>
                    <button
                      onClick={handleDeleteGame}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-bold"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={selectedGame.name}
                        onChange={(e) =>
                          handleGameChange("name", e.target.value)
                        }
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Nombre de la moneda o denominación
                      </label>
                      <input
                        type="text"
                        value={selectedGame.currencyName}
                        onChange={(e) =>
                          handleGameChange("currencyName", e.target.value)
                        }
                        placeholder="Ej: Diamantes, UC, USD, Puntos"
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Tipo de Producto
                      </label>
                      <select
                        value={selectedGame.isGiftCard || selectedGame.category === 'giftcard' ? 'giftcard' : 'game'}
                        onChange={(e) => {
                          const isGift = e.target.value === 'giftcard';
                          handleGameChange('isGiftCard', isGift);
                          if (isGift) {
                            handleGameChange('category', 'giftcard');
                          } else if (selectedGame.category === 'giftcard') {
                            handleGameChange('category', 'mobile');
                          }
                        }}
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="game">🎮 Juego (Recarga Directa por ID)</option>
                        <option value="giftcard">🎁 Tarjeta de Regalo (Gift Card)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Categoría / Plataforma
                      </label>
                      <select
                        value={selectedGame.category}
                        onChange={(e) =>
                          handleGameChange("category", e.target.value)
                        }
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="mobile">Móvil</option>
                        <option value="pc">PC</option>
                        <option value="console">Consola</option>
                        <option value="giftcard">Gift Card</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6 bg-surface-elevated p-4 rounded-xl border border-glass-border">
                  <h3 className="font-bold text-on-surface text-sm mb-4">
                    Imágenes del Juego
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                        Banner (Portada)
                      </label>
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer w-full">
                        {selectedGame.bannerUrl ? (
                          <img
                            src={selectedGame.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            Sin banner
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                            <Edit2 size={14} /> Cambiar Banner
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "bannerUrl")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 mt-2">
                          URL del Banner
                        </label>
                        <input
                          type="text"
                          value={selectedGame.bannerUrl || ""}
                          placeholder="https://ejemplo.com/banner.png"
                          onChange={(e) =>
                            handleGameChange("bannerUrl", e.target.value)
                          }
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                        Card (Miniatura)
                      </label>
                      <div className="relative aspect-[3/4] max-w-[150px] rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer">
                        {selectedGame.cardUrl ? (
                          <img
                            src={selectedGame.cardUrl}
                            alt="Card"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            Sin card
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                            <Edit2 size={14} /> Cambiar
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "cardUrl")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 mt-2">
                          URL de la Miniatura
                        </label>
                        <input
                          type="text"
                          value={selectedGame.cardUrl || ""}
                          placeholder="https://ejemplo.com/card.png"
                          onChange={(e) =>
                            handleGameChange("cardUrl", e.target.value)
                          }
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(selectedGame.packages || []).map((pkg, index) => (
                    <div
                      key={`${pkg.id || 'pkg'}-${index}`}
                      className="bg-surface-elevated p-4 rounded-xl border border-glass-border flex flex-col md:flex-row gap-4 items-center"
                    >
                      <div className="flex items-center gap-3 w-full md:w-auto font-bold text-on-surface-variant shrink-0">
                        <span className="w-6 h-6 flex items-center justify-center bg-surface rounded-full text-xs">
                          {index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                            Cantidad ({pkg.currency})
                          </label>
                          <input
                            type="number"
                            value={pkg.amount}
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "amount",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                            Precio (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={pkg.price}
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "price",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                            Descuento (%)
                          </label>
                          <input
                            type="number"
                            value={pkg.discountPercentage ?? ""}
                            placeholder="0"
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "discountPercentage",
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                            className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                            Bonus (Opcional)
                          </label>
                          <input
                            type="number"
                            value={pkg.bonus ?? ""}
                            placeholder="0"
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "bonus",
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                            className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="w-full mt-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer shrink-0 p-1 flex items-center justify-center">
                          {pkg.iconUrl ? (
                            <img
                              src={pkg.iconUrl}
                              alt="Icono"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-center text-on-surface-variant leading-tight">
                              Sin icono
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Edit2 size={16} className="text-on-surface" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handlePackageImageUpload(e, pkg.id)
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-grow">
                          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                            URL (O subir imagen)
                          </label>
                          <input
                            type="text"
                            value={pkg.iconUrl}
                            placeholder="https://ejemplo.com/icono.png"
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "iconUrl",
                                e.target.value,
                              )
                            }
                            className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
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
                <h3 className="text-xl font-bold text-on-surface mb-2">
                  Selecciona un juego
                </h3>
                <p>
                  Elige un juego de la lista para editar sus paquetes y precios.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "promos" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Códigos de Descuento
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Crea y gestiona códigos para embajadores.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          <div className="space-y-4">
            {localPromoCodes.map((code, index) => (
              <div
                key={`${code.id || 'code'}-${index}`}
                className="bg-surface-elevated p-4 rounded-xl border border-glass-border flex flex-col md:flex-row gap-4 items-center"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      value={code.code}
                      onChange={(e) =>
                        handlePromoCodeChange(
                          code.id,
                          "code",
                          e.target.value.toUpperCase(),
                        )
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      value={code.discountPercentage}
                      onChange={(e) =>
                        handlePromoCodeChange(
                          code.id,
                          "discountPercentage",
                          Number(e.target.value),
                        )
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Activo
                    </label>
                    <select
                      value={code.active ? "true" : "false"}
                      onChange={(e) =>
                        handlePromoCodeChange(
                          code.id,
                          "active",
                          e.target.value === "true",
                        )
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2.5 px-3 text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Usos
                    </label>
                    <input
                      type="number"
                      disabled
                      value={code.usageCount}
                      className="w-full bg-surface/50 border border-glass-border rounded-lg py-2 px-3 text-on-surface-variant opacity-70"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePromoCode(code.id)}
                  className="p-2.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg shrink-0 transition-colors w-full md:w-auto flex justify-center mt-2 md:mt-0"
                  title="Eliminar código"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddPromoCode}
              className="w-full border-2 border-dashed border-glass-border rounded-xl py-4 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors gap-2 font-bold"
            >
              <Plus size={24} />
              Añadir Nuevo Código
            </button>
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Configuración Web
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Personaliza las imágenes de la mascota.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border">
              <h3 className="font-bold text-on-surface text-lg mb-4">
                Mascota Principal (Inicio)
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-48 rounded-2xl overflow-hidden border border-glass-border bg-surface-container group cursor-pointer mx-auto">
                  {localSettings.mascotHomeUrl ? (
                    <img
                      src={localSettings.mascotHomeUrl}
                      alt="Mascota Inicio"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <Settings size={32} className="mb-2" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                      <Edit2 size={14} /> Cambiar
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSettingsImageUpload(e, "mascotHomeUrl")
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    value={localSettings.mascotHomeUrl || ""}
                    placeholder="Dejar vacío para usar la predeterminada"
                    onChange={(e) =>
                      handleSettingsChange("mascotHomeUrl", e.target.value)
                    }
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showMascotHome}
                    onChange={(e) =>
                      handleSettingsChange("showMascotHome", e.target.checked)
                    }
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Mostrar mascota en Inicio
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border">
              <h3 className="font-bold text-on-surface text-lg mb-4">
                Mascota de Soporte
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-48 rounded-full overflow-hidden border-4 border-surface shadow-xl group cursor-pointer mx-auto">
                  {localSettings.mascotSupportUrl ? (
                    <img
                      src={localSettings.mascotSupportUrl}
                      alt="Mascota Soporte"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container">
                      <Settings size={32} className="mb-2" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                      <Edit2 size={14} /> Cambiar
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSettingsImageUpload(e, "mascotSupportUrl")
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    value={localSettings.mascotSupportUrl || ""}
                    placeholder="Dejar vacío para usar la predeterminada"
                    onChange={(e) =>
                      handleSettingsChange("mascotSupportUrl", e.target.value)
                    }
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showMascotSupport}
                    onChange={(e) =>
                      handleSettingsChange(
                        "showMascotSupport",
                        e.target.checked,
                      )
                    }
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Mostrar mascota en Soporte
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border">
              <h3 className="font-bold text-on-surface text-lg mb-4">
                Mascota de Login
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-32 rounded-full overflow-hidden border-4 border-surface shadow-lg group cursor-pointer mx-auto bg-surface-container">
                  {localSettings.mascotLoginUrl ? (
                    <img
                      src={localSettings.mascotLoginUrl}
                      alt="Mascota Login"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <Settings size={24} className="mb-1" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-primary px-2 py-1 rounded text-on-surface text-[10px] font-bold flex items-center gap-1">
                      <Edit2 size={12} /> Cambiar
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSettingsImageUpload(e, "mascotLoginUrl")
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    value={localSettings.mascotLoginUrl || ""}
                    placeholder="Dejar vacío para usar predeterminada"
                    onChange={(e) =>
                      handleSettingsChange("mascotLoginUrl", e.target.value)
                    }
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showMascotLogin}
                    onChange={(e) =>
                      handleSettingsChange("showMascotLogin", e.target.checked)
                    }
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Mostrar mascota en Login
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "payments" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Métodos de Pago
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Gestiona los métodos de pago y sus instrucciones.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          
          <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border mb-6">
            <h3 className="font-bold text-on-surface mb-4">Canales de Contacto y Soporte</h3>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                Número de Teléfono / WhatsApp de Soporte
              </label>
              <input
                type="text"
                value={localSettings.supportPhone || "+584142943532"}
                onChange={(e) => handleSettingsChange("supportPhone", e.target.value)}
                className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                placeholder="Ej: +584142943532"
              />
              <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
                Este número se utilizará en los botones directos de WhatsApp para atención y soporte 24/7.
              </p>
            </div>
          </div>

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

          {/* BINANCE API INTEGRATION & VALIDATION CARD */}
          <div className="bg-surface-elevated p-6 rounded-2xl border-2 border-amber-500/30 shadow-[0_4px_25px_rgba(240,185,11,0.1)] mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-glass-border pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 text-[#F0B90B] flex items-center justify-center border border-[#F0B90B]/40 shadow-[0_0_15px_rgba(240,185,11,0.25)]">
                  <Bitcoin size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-on-surface">
                      Autorización y Validación con <span className="text-[#F0B90B]">Binance API</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-[#F0B90B] border border-amber-500/30">
                      API v3 & Pay
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Verifica automáticamente los pagos de USDT y Binance Pay mediante tu Clave API y Clave Secreta.
                  </p>
                </div>
              </div>

              {/* Enable toggle */}
              <label className="flex items-center gap-3 cursor-pointer bg-surface px-4 py-2 rounded-xl border border-glass-border hover:border-amber-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.binanceEnabled || false}
                  onChange={(e) => handleSettingsChange("binanceEnabled", e.target.checked)}
                  className="w-5 h-5 text-amber-500 bg-surface-container border-glass-border rounded focus:ring-amber-400"
                />
                <span className="text-sm font-bold text-on-surface">
                  {localSettings.binanceEnabled ? "Validación Activa" : "Desactivado"}
                </span>
              </label>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key Input */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1.5">
                    <Key size={14} className="text-[#F0B90B]" />
                    Clave API de Binance (API Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showBinanceApiKey ? "text" : "password"}
                      value={localSettings.binanceApiKey || ""}
                      onChange={(e) => handleSettingsChange("binanceApiKey", e.target.value)}
                      placeholder="Pega aquí tu API Key de Binance..."
                      className="w-full bg-surface border border-glass-border rounded-xl py-2.5 pl-3 pr-10 text-on-surface text-sm font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBinanceApiKey(!showBinanceApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      title={showBinanceApiKey ? "Ocultar" : "Mostrar"}
                    >
                      {showBinanceApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Secret Key Input */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#F0B90B]" />
                    Clave Secreta de Binance (Secret Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showBinanceSecret ? "text" : "password"}
                      value={localSettings.binanceApiSecret || ""}
                      onChange={(e) => handleSettingsChange("binanceApiSecret", e.target.value)}
                      placeholder="Pega aquí tu Secret Key de Binance..."
                      className="w-full bg-surface border border-glass-border rounded-xl py-2.5 pl-3 pr-10 text-on-surface text-sm font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBinanceSecret(!showBinanceSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      title={showBinanceSecret ? "Ocultar" : "Mostrar"}
                    >
                      {showBinanceSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Binance Pay ID / Merchant ID */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Binance Pay ID / Email de Cuenta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={localSettings.binancePayId || ""}
                    onChange={(e) => handleSettingsChange("binancePayId", e.target.value)}
                    placeholder="Ej: 82938172 o tu email de Binance"
                    className="w-full bg-surface border border-glass-border rounded-xl py-2.5 px-3 text-on-surface text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Se mostrará a los clientes para facilitar sus pagos directos a tu cuenta.
                  </p>
                </div>

                {/* Custom Payment Link */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Link de Cobro Binance Pay (Opcional)
                  </label>
                  <input
                    type="text"
                    value={localSettings.binanceCustomPayUrl || ""}
                    onChange={(e) => handleSettingsChange("binanceCustomPayUrl", e.target.value)}
                    placeholder="https://pay.binance.com/..."
                    className="w-full bg-surface border border-glass-border rounded-xl py-2.5 px-3 text-on-surface text-sm focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Enlace directo de cobro creado en Binance si deseas abrirlo directamente.
                  </p>
                </div>

                {/* Validation Mode */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Modo de Validación Automática
                  </label>
                  <select
                    value={localSettings.binanceValidationMode || "auto"}
                    onChange={(e) => handleSettingsChange("binanceValidationMode", e.target.value)}
                    className="w-full bg-surface border border-glass-border rounded-xl py-2.5 px-3 text-on-surface text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="auto">Validación Inteligente Combinada (Pay & Depósitos)</option>
                    <option value="api_transactions">Historial de Transacciones Pay / C2C</option>
                    <option value="merchant_pay">Binance Pay Merchant Oficial (v2/v3)</option>
                  </select>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Revisa las transacciones registradas en tu Binance para validar al instante.
                  </p>
                </div>
              </div>

              {/* Action: Test Connection Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleTestBinanceConnection}
                  disabled={isTestingBinance || !localSettings.binanceApiKey || !localSettings.binanceApiSecret}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(240,185,11,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isTestingBinance ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Probando Conexión con Binance...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Probar Conexión con Binance API
                    </>
                  )}
                </button>

                <span className="text-xs text-on-surface-variant">
                  {localSettings.binanceApiKey && localSettings.binanceApiSecret
                    ? "✓ Credenciales listas para verificación"
                    : "⚠️ Ingresa tu API Key y Secret Key para probar"}
                </span>
              </div>

              {/* Test Result Banner */}
              {binanceTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm animate-in fade-in duration-300 ${
                    binanceTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {binanceTestResult.success ? (
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 w-full">
                      <p className="font-bold text-sm">{binanceTestResult.message}</p>
                      {binanceTestResult.success && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-500/20 text-xs font-mono">
                          <div>
                            <span className="text-slate-400 block">Latencia:</span>
                            <span className="font-bold text-emerald-400">{binanceTestResult.latencyMs} ms</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tipo de Cuenta:</span>
                            <span className="font-bold text-emerald-400">{binanceTestResult.accountType || "SPOT"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Saldo USDT Disponible:</span>
                            <span className="font-bold text-emerald-400">${binanceTestResult.usdtBalance} USDT</span>
                          </div>
                        </div>
                      )}
                      {binanceTestResult.error && (
                        <p className="text-xs text-red-300 mt-1">
                          Detalle: {binanceTestResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informative Guidance Accordion */}
              <div className="p-3.5 rounded-xl bg-surface border border-glass-border text-xs text-on-surface-variant space-y-1.5">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Key size={13} />
                  ¿Cómo generar tus credenciales en Binance?
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Inicia sesión en tu cuenta de <strong className="text-white">Binance</strong> y ve a <strong className="text-white">Perfil → Gestión de API</strong>.</li>
                  <li>Haz clic en <strong className="text-white">Crear API</strong> (Generada por el sistema) y asigna un nombre (ej: "NexPlay").</li>
                  <li>Copia la <strong className="text-amber-300">API Key</strong> y la <strong className="text-amber-300">Secret Key</strong> (solo se muestra una vez).</li>
                  <li>En las restricciones de la API, asegúrate de tener marcado <strong className="text-white">"Habilitar lectura"</strong> (no requiere permisos de retiro).</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {(localSettings.paymentMethods || []).map((method, index) => (
              <div
                key={`${method.id || 'pm'}-${index}`}
                className="bg-surface-elevated p-6 rounded-xl border border-glass-border relative group"
              >
                <button
                  onClick={() => {
                    const newMethods = (localSettings.paymentMethods || []).filter(
                      (_, i) => i !== index,
                    );
                    handleSettingsChange("paymentMethods", newMethods);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                  title="Eliminar Método"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pr-12">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Nombre del Método
                    </label>
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => {
                        const newMethods = [...(localSettings.paymentMethods || [])];
                        newMethods[index].name = e.target.value;
                        handleSettingsChange("paymentMethods", newMethods);
                      }}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Tipo de Ícono
                    </label>
                    <select
                      value={method.iconType}
                      onChange={(e) => {
                        const newMethods = [...(localSettings.paymentMethods || [])];
                        newMethods[index].iconType = e.target.value as any;
                        handleSettingsChange("paymentMethods", newMethods);
                      }}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="payments">Billetes (Pagos)</option>
                      <option value="account_balance">
                        Banco (Zelle/Transf)
                      </option>
                      <option value="credit_card">Tarjeta de Crédito</option>
                      <option value="binance">Binance / Crypto</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Moneda
                    </label>
                    <select
                      value={method.currency || 'USD'}
                      onChange={(e) => {
                        const newMethods = [...(localSettings.paymentMethods || [])];
                        newMethods[index].currency = e.target.value as any;
                        handleSettingsChange("paymentMethods", newMethods);
                      }}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="USD">USD (Dólares)</option>
                      <option value="VES">VES (Bolívares)</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    Instrucciones / Datos de Pago
                  </label>
                  <textarea
                    value={method.instructions || ""}
                    onChange={(e) => {
                      const newMethods = [...(localSettings.paymentMethods || [])];
                      newMethods[index].instructions = e.target.value;
                      handleSettingsChange("paymentMethods", newMethods);
                    }}
                    placeholder="Ej: Banco: Bancaribe\nCédula: 1234567\nTeléfono: 0412-1234567"
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none min-h-[90px] resize-y font-mono text-sm"
                  />
                </div>

                {/* QR CODE CONFIGURATION FOR PAYMENT METHOD */}
                <div className="p-4 rounded-xl bg-surface/70 border border-glass-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase">
                      <QrCode size={15} className="text-cyan-400" />
                      Código QR para este Método (Opcional)
                    </label>
                    {method.qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const newMethods = [...(localSettings.paymentMethods || [])];
                          newMethods[index].qrCodeUrl = "";
                          newMethods[index].qrTitle = "";
                          handleSettingsChange("paymentMethods", newMethods);
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Quitar QR
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                          URL de la imagen del Código QR
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={method.qrCodeUrl || ""}
                            onChange={(e) => {
                              const newMethods = [...(localSettings.paymentMethods || [])];
                              newMethods[index].qrCodeUrl = e.target.value;
                              handleSettingsChange("paymentMethods", newMethods);
                            }}
                            placeholder="https://... o sube una imagen directa"
                            className="w-full bg-surface border border-glass-border rounded-lg py-1.5 px-3 text-on-surface text-xs focus:border-cyan-400 focus:outline-none font-mono"
                          />
                          <label className="shrink-0 bg-surface-container hover:bg-surface-elevated text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors">
                            <Upload size={13} />
                            Subir QR
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newMethods = [...(localSettings.paymentMethods || [])];
                                    newMethods[index].qrCodeUrl = reader.result as string;
                                    handleSettingsChange("paymentMethods", newMethods);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                          Texto / Título sobre el QR (Opcional)
                        </label>
                        <input
                          type="text"
                          value={method.qrTitle || ""}
                          onChange={(e) => {
                            const newMethods = [...(localSettings.paymentMethods || [])];
                            newMethods[index].qrTitle = e.target.value;
                            handleSettingsChange("paymentMethods", newMethods);
                          }}
                          placeholder={`Ej: Escanea para pagar con ${method.name}`}
                          className="w-full bg-surface border border-glass-border rounded-lg py-1.5 px-3 text-on-surface text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* QR Preview */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface border border-glass-border min-h-[100px]">
                      {method.qrCodeUrl ? (
                        <div className="w-24 h-24 bg-white p-1 rounded-md shadow flex items-center justify-center overflow-hidden">
                          <img
                            src={method.qrCodeUrl}
                            alt="Vista previa QR"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-2">
                          <QrCode size={28} className="mx-auto text-slate-600 mb-1" />
                          <span className="text-[10px] text-on-surface-variant block">Sin código QR</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const newMethods = [
                  ...(localSettings.paymentMethods || []),
                  {
                    id: `pm_${Date.now()}`,
                    name: "Nuevo Método",
                    iconType: "payments" as any,
                  },
                ];
                handleSettingsChange("paymentMethods", newMethods);
              }}
              className="w-full py-4 border-2 border-dashed border-glass-border rounded-xl text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 font-bold"
            >
              <Plus size={20} /> Agregar Método de Pago
            </button>
          </div>
        </div>
      ) : activeTab === "orders" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Órdenes
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Gestiona y aprueba los pedidos de los usuarios.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">
                    ID Orden
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden md:table-cell">
                    Usuario
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden lg:table-cell">
                    Player ID
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">
                    Juego/Paquete
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden sm:table-cell">
                    Referencia
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">
                    Total
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm text-center">
                    Estado
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-on-surface-variant"
                    >
                      No hay órdenes disponibles.
                    </td>
                  </tr>
                ) : (
                  (orders || []).map((order, index) => (
                    <tr
                      key={`${order.id || 'order'}-${index}`}
                      className="border-b border-glass-border/50 hover:bg-surface-elevated/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-sm hidden md:table-cell">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm hidden md:table-cell">
                        <div className="truncate max-w-[150px]" title={order.userEmail}>
                          {order.userEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm hidden lg:table-cell">
                        {order.playerId ? (
                          <div className="text-xs text-tertiary-container font-mono font-bold whitespace-nowrap">
                            {order.playerId}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="font-bold truncate max-w-[120px] md:max-w-none">{order.gameName}</div>
                        <div className="text-on-surface-variant text-xs truncate max-w-[120px] md:max-w-none">
                          {order.packageName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-tertiary-container hidden sm:table-cell">
                        {order.referenceNumber || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-primary whitespace-nowrap">
                        Bs {order.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                            order.status === "completed"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : order.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Completado"
                            : order.status === "pending"
                              ? "Pendiente"
                              : order.status === "rejected"
                                ? "Rechazado"
                                : "Fallido"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded border border-primary/50 transition-colors"
                            title="Ver Detalles"
                          >
                            <Eye size={16} />
                          </button>
                          {order.status === "pending" && onUpdateOrder && (
                            <>
                              <button
                                onClick={() =>
                                  onUpdateOrder(order.id, "completed")
                                }
                                className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded border border-green-500/50 transition-colors"
                                title="Aprobar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateOrder(order.id, "rejected")
                                }
                                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/50 transition-colors"
                                title="Rechazar"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "emails" ? (
        <EmailComposer orders={orders || []} />
      ) : null}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-surface-container border border-glass-border rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              ¿Eliminar Juego?
            </h3>
            <p className="text-on-surface-variant font-medium text-sm mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los paquetes
              asociados a este juego.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-surface border border-glass-border text-on-surface hover:bg-surface-elevated transition-colors"
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

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div 
            className="bg-surface-container border border-glass-border rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-glass-border sticky top-0 bg-surface-container z-10">
              <h3 className="text-xl font-bold text-on-surface">Detalles del Pago</h3>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors bg-surface-elevated p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">ID de Orden</p>
                  <p className="text-on-surface font-mono">{selectedOrderDetails.id}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Fecha</p>
                  <p className="text-on-surface">{new Date(selectedOrderDetails.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Usuario (Email)</p>
                  <p className="text-on-surface">{selectedOrderDetails.userEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">ID de Jugador</p>
                  <p className="text-tertiary-container font-mono font-bold">{selectedOrderDetails.playerId || "N/A"}</p>
                </div>
                <div className="col-span-2 border-t border-glass-border pt-4 mt-2"></div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Juego</p>
                  <p className="text-on-surface font-bold">{selectedOrderDetails.gameName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Paquete</p>
                  <p className="text-on-surface">{selectedOrderDetails.packageName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Método de Pago</p>
                  <p className="text-on-surface">{selectedOrderDetails.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Referencia</p>
                  <p className="text-tertiary-container font-mono">{selectedOrderDetails.referenceNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Total a Pagar</p>
                  <p className="text-primary font-bold text-lg">Bs {selectedOrderDetails.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Estado</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      selectedOrderDetails.status === "completed"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : selectedOrderDetails.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {selectedOrderDetails.status === "completed"
                      ? "Completado"
                      : selectedOrderDetails.status === "pending"
                        ? "Pendiente"
                        : selectedOrderDetails.status === "rejected"
                          ? "Rechazado"
                          : "Fallido"}
                  </span>
                </div>
              </div>
              
              {selectedOrderDetails.assaxResult && (
                <div className="mt-4 border-t border-glass-border pt-4">
                  <p className="text-on-surface-variant font-bold mb-2">Resultado Assax Store</p>
                  <pre className="w-full bg-black/40 rounded-lg p-3 border border-glass-border text-xs text-on-surface whitespace-pre-wrap font-mono overflow-auto max-h-32">
                    {JSON.stringify(selectedOrderDetails.assaxResult, null, 2)}
                  </pre>
                </div>
              )}
{selectedOrderDetails.receiptUrl && (
                <div className="mt-4 border-t border-glass-border pt-4">
                  <p className="text-on-surface-variant font-bold mb-2">Comprobante Adjunto</p>
                  <div className="w-full bg-black/40 rounded-lg p-2 border border-glass-border flex justify-center">
                    <img 
                      src={selectedOrderDetails.receiptUrl} 
                      alt="Comprobante de pago" 
                      className="max-h-64 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            {selectedOrderDetails.status === "pending" && onUpdateOrder && (
              <div className="flex gap-3 w-full p-6 border-t border-glass-border bg-surface-elevated/50">
                <button
                  onClick={() => {
                    onUpdateOrder(selectedOrderDetails.id, "rejected");
                    setSelectedOrderDetails(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} /> Rechazar
                </button>
                <button
                  onClick={() => {
                    onUpdateOrder(selectedOrderDetails.id, "completed");
                    setSelectedOrderDetails(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Aprobar Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
