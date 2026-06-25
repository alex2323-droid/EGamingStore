import React, { useState, useEffect } from "react";
import { Mail, Lock, Gamepad2, AlertCircle } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const showMascot = siteSettings ? siteSettings.showMascotLogin : true;
  const currentMascotUrl = siteSettings?.mascotLoginUrl || mascotImg;

  useEffect(() => {
    // If the user was logged in previously but session expired,
    // they need to log in again. We don't automatically sign them in here
    // unless their session is still fresh. App.tsx should handle that logic.
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const inputVal = email.trim();
    if (!inputVal) {
      setError("Por favor, ingresa tu correo o nombre de usuario.");
      setLoading(false);
      return;
    }

    // Determine if email or username under the hood
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
      // Save last login time before authentication to avoid race condition with onAuthStateChanged
      try {
        localStorage.setItem("lastLoginTime", Date.now().toString());
      } catch (e) {
        console.warn("localStorage access denied", e);
      }

      try {
        await signInWithEmailAndPassword(auth, formattedEmail, password);
      } catch (signInErr: any) {
        // If user not found or invalid credential, try to create the account automatically
        if (
          signInErr.code === "auth/user-not-found" ||
          signInErr.code === "auth/invalid-credential" ||
          signInErr.code === "auth/invalid-login-credentials"
        ) {
          try {
            await createUserWithEmailAndPassword(
              auth,
              formattedEmail,
              password,
            );
          } catch (createErr: any) {
            if (createErr.code === "auth/email-already-in-use") {
              setError("Contraseña incorrecta para este usuario.");
            } else if (createErr.code === "auth/weak-password") {
              setError("La contraseña debe tener al menos 6 caracteres.");
            } else {
              setError(createErr.message || "Error al crear la cuenta.");
            }
            setLoading(false);
            return;
          }
        } else if (signInErr.code === "auth/wrong-password") {
          setError("Contraseña incorrecta.");
          setLoading(false);
          return;
        } else {
          setError(signInErr.message || "Error de autenticación.");
          setLoading(false);
          return;
        }
      }

      onLoginSuccess();
    } catch (err: any) {
      setError("Ocurrió un error inesperado.");
    } finally {
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

          <h1 className="font-display text-2xl font-bold text-center text-on-surface mb-2 uppercase tracking-wide">
            E Gaming Store
          </h1>
          <p className="text-center text-on-surface-variant font-medium mb-8">
            Ingresa o crea tu cuenta automáticamente
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface-container-low border border-glass-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-6 flex justify-center"
            >
              {loading ? "Cargando..." : "Ingresar / Registrarse"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
