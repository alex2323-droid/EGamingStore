import React, { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle, UserPlus, LogIn } from "lucide-react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import mascotImg from "../assets/images/mascot_1782343593124.jpg";
import { SiteSettings } from "../types";

interface Props {
  onLoginSuccess: () => void;
  siteSettings?: SiteSettings | null;
}

export default function Login({ onLoginSuccess, siteSettings }: Props) {
  const [activeTab, setActiveTab] = useState<"signIn" | "register">("signIn");
  
  // Sign In States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Register States
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const showMascot = siteSettings ? siteSettings.showMascotLogin : true;
  const currentMascotUrl = siteSettings?.mascotLoginUrl || mascotImg;

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const inputVal = signInEmail.trim();
    if (!inputVal) {
      setError("Por favor, ingresa tu correo o nombre de usuario.");
      setLoading(false);
      return;
    }

    let formattedEmail = inputVal;
    if (!formattedEmail.includes("@")) {
      const sanitizedUsername = formattedEmail.replace(/[^a-zA-Z0-9_.-]/g, "");
      if (!sanitizedUsername) {
        setError("El nombre de usuario contiene caracteres no válidos.");
        setLoading(false);
        return;
      }
      formattedEmail = `${sanitizedUsername.toLowerCase()}@egamingstore.com`;
    }

    try {
      try {
        localStorage.setItem("lastLoginTime", Date.now().toString());
      } catch (e) {
        console.warn("localStorage access denied", e);
      }

      await signInWithEmailAndPassword(auth, formattedEmail, signInPassword);
      onLoginSuccess();
    } catch (signInErr: any) {
      if (
        signInErr.code === "auth/user-not-found" ||
        signInErr.code === "auth/invalid-credential" ||
        signInErr.code === "auth/invalid-login-credentials"
      ) {
        setError("Usuario no encontrado o credenciales inválidas.");
      } else if (signInErr.code === "auth/wrong-password") {
        setError("Contraseña incorrecta.");
      } else {
        setError(signInErr.message || "Error de autenticación.");
      }
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const email = registerEmail.trim();
    if (!email || !email.includes("@")) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    
    if (email.endsWith("@egamingstore.com")) {
      setError("No puedes usar este dominio para registrarte.");
      return;
    }

    if (registerPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, registerPassword);
      onLoginSuccess();
    } catch (createErr: any) {
      if (createErr.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado.");
      } else if (createErr.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError(createErr.message || "Error al crear la cuenta.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-glass-border shadow-2xl animation-fade-in relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          {showMascot && (
            <div className="flex justify-center mb-6">
              <img
                src={currentMascotUrl}
                alt="Mascota E Gaming Store"
                className="w-24 h-24 object-cover rounded-full shadow-lg border-4 border-surface bg-surface-container"
              />
            </div>
          )}

          <h1 className="font-display text-2xl font-bold text-center text-on-surface mb-6 uppercase tracking-wide">
            E Gaming Store
          </h1>

          {/* Tabs */}
          <div className="flex bg-surface-container-low p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setActiveTab("signIn");
              }}
              className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "signIn"
                  ? "bg-primary text-white shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <LogIn size={16} /> Ingresar
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-primary text-white shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <UserPlus size={16} /> Registro
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {activeTab === "signIn" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  Correo o Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-glass-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    placeholder="ejemplo@correo.com o tu_usuario"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-glass-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary btn-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-6 flex justify-center disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
                <form onSubmit={handleCreateAccount} className="space-y-4 animation-fade-in">
                  <p className="text-sm text-on-surface-variant text-center mb-2">
                    Crea una cuenta para comenzar a recargar.
                  </p>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="w-full bg-surface-container-low border border-glass-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-surface-container-low border border-glass-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1.5">Mínimo 6 caracteres.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || registerPassword.length < 6 || !registerEmail}
                    className="w-full btn-primary btn-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-6 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Creando..." : "Crear Cuenta"}
                  </button>
                </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

