import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus,
  KeyRound,
  X,
} from "lucide-react";
import { auth, googleSignIn } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import nexplayMascot from "../assets/images/nexplay_mascot.jpg";
import { SiteSettings } from "../types";
import NexPlayLogo from "./NexPlayLogo";

interface Props {
  onLoginSuccess: () => void;
  siteSettings?: SiteSettings | null;
}

export default function Login({ onLoginSuccess, siteSettings }: Props) {
  const [activeTab, setActiveTab] = useState<"signIn" | "register">("signIn");

  // Sign In States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register States
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Forgot Password Modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // General Status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const currentMascotUrl = siteSettings?.mascotLoginUrl || nexplayMascot;

  // Load saved email if rememberMe was previously set
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("nexplay_remembered_email");
      if (savedEmail) {
        setSignInEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, []);

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [activeTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const inputVal = signInEmail.trim();
    if (!inputVal) {
      setError("Por favor, ingresa tu correo electrónico o nombre de usuario.");
      setLoading(false);
      return;
    }

    if (!signInPassword) {
      setError("Por favor, ingresa tu contraseña.");
      setLoading(false);
      return;
    }

    // Save or clear rememberMe
    try {
      if (rememberMe) {
        localStorage.setItem("nexplay_remembered_email", inputVal);
      } else {
        localStorage.removeItem("nexplay_remembered_email");
      }
      localStorage.setItem("lastLoginTime", Date.now().toString());
    } catch {
      // Ignore
    }

    let formattedEmail = inputVal;
    const isUsername = !formattedEmail.includes("@");
    if (isUsername) {
      const sanitized = formattedEmail.replace(/[^a-zA-Z0-9_.-]/g, "");
      if (!sanitized) {
        setError("El nombre de usuario contiene caracteres no válidos.");
        setLoading(false);
        return;
      }
      formattedEmail = `${sanitized.toLowerCase()}@nexplay.com`;
    }

    try {
      await signInWithEmailAndPassword(auth, formattedEmail, signInPassword);
      onLoginSuccess();
    } catch (signInErr: any) {
      // If it was a username login and failed with @nexplay.com, try fallback to legacy @egamingstore.com
      if (isUsername) {
        try {
          const legacyEmail = `${inputVal.toLowerCase()}@egamingstore.com`;
          await signInWithEmailAndPassword(auth, legacyEmail, signInPassword);
          onLoginSuccess();
          return;
        } catch {
          // Fall through to standard error handling
        }
      }

      if (
        signInErr.code === "auth/user-not-found" ||
        signInErr.code === "auth/invalid-credential" ||
        signInErr.code === "auth/invalid-login-credentials"
      ) {
        setError("Correo/usuario no encontrado o credenciales incorrectas.");
      } else if (signInErr.code === "auth/wrong-password") {
        setError("Contraseña incorrecta. Verifica e intenta de nuevo.");
      } else if (signInErr.code === "auth/too-many-requests") {
        setError("Demasiados intentos fallidos. Intenta nuevamente en unos minutos.");
      } else {
        setError(signInErr.message || "Error al iniciar sesión.");
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

    if (registerPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, registerPassword);
      onLoginSuccess();
    } catch (createErr: any) {
      if (createErr.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
      } else if (createErr.code === "auth/weak-password") {
        setError("La contraseña es muy débil. Debe tener al menos 6 caracteres.");
      } else if (createErr.code === "auth/invalid-email") {
        setError("El formato de correo no es válido.");
      } else {
        setError(createErr.message || "Error al registrar la cuenta.");
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSocialLoading("google");
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onLoginSuccess();
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Error al continuar con Google.");
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleLogin = () => {
    setError("El inicio de sesión con Apple estará disponible próximamente en tu región. Usa Google o correo.");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const targetEmail = resetEmail.trim() || signInEmail.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setResetError("Ingresa un correo electrónico válido para restablecer la contraseña.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSuccess(
        `Hemos enviado un enlace de recuperación a ${targetEmail}. Revisa tu bandeja de entrada o spam.`
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setResetError("No existe ninguna cuenta con este correo electrónico.");
      } else {
        setResetError(err.message || "Error al enviar el correo de recuperación.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Cyber Neon Background Elements */}
      <div className="absolute inset-0 bg-radial from-[#071d3f] via-[#030917] to-[#02050e] pointer-events-none"></div>

      {/* Cyber Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #00d2ff 1px, transparent 1px), linear-gradient(to bottom, #00d2ff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Volumetric Spotlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Top Header Logo (Small) */}
        <div className="w-full flex justify-center mb-6">
          <NexPlayLogo size="sm" showSubtitle={false} />
        </div>

        {/* Futuristic Neon Login Card */}
        <div className="w-full">
          <div className="relative rounded-[28px] p-6 sm:p-9 bg-[#040e22]/90 backdrop-blur-xl border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(0,194,255,0.22)] overflow-hidden">
            {/* Subtle Card Glow Highlights */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* TAB SWITCHER: Iniciar Sesión / Registrarse */}
              <div className="relative z-10 flex bg-[#030a17] p-1 rounded-2xl mb-7 border border-cyan-900/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab("signIn")}
                  className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "signIn"
                      ? "bg-gradient-to-r from-cyan-400 to-[#00b4d8] text-slate-950 shadow-[0_0_15px_rgba(0,194,255,0.5)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <LogIn size={16} />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "register"
                      ? "bg-gradient-to-r from-cyan-400 to-[#00b4d8] text-slate-950 shadow-[0_0_15px_rgba(0,194,255,0.5)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserPlus size={16} />
                  <span>Registrarse</span>
                </button>
              </div>

              {/* CARD TITLE & SUBTITLE */}
              <div className="relative z-10 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                  {activeTab === "signIn" ? "¡Hola de nuevo!" : "¡Crea tu cuenta!"}
                </h1>
                <p className="text-sm text-slate-300/85 mt-1.5 leading-relaxed">
                  {activeTab === "signIn"
                    ? "Inicia sesión para seguir disfrutando de todos nuestros servicios."
                    : "Únete a NexPlay para disfrutar de recargas instantáneas y ofertas exclusivas."}
                </p>
              </div>

              {/* ERROR NOTIFICATION */}
              {error && (
                <div className="relative z-10 mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm animate-shake">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS NOTIFICATION */}
              {successMsg && (
                <div className="relative z-10 mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* FORM: INICIAR SESIÓN */}
              {activeTab === "signIn" ? (
                <form onSubmit={handleSignIn} className="relative z-10 space-y-4">
                  {/* Correo Electrónico Input */}
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                        <Mail size={19} />
                      </div>
                      <input
                        type="text"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className="w-full bg-[#07152b] border border-cyan-900/60 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="Correo electrónico o usuario"
                      />
                    </div>
                  </div>

                  {/* Contraseña Input */}
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                        <Lock size={19} />
                      </div>
                      <input
                        type={showSignInPassword ? "text" : "password"}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        className="w-full bg-[#07152b] border border-cyan-900/60 rounded-xl py-3.5 pl-11 pr-11 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="Contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Options Row: Recordarme & ¿Olvidaste tu contraseña? */}
                  <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-cyan-800 bg-[#07152b] text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 transition cursor-pointer accent-cyan-500"
                      />
                      <span className="text-slate-300 group-hover:text-white transition-colors">
                        Recordarme
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(signInEmail);
                        setShowForgotPassword(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {/* Primary CTA Button: Iniciar Sesión */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#00d2ff] via-[#00a6fb] to-[#0077b6] hover:from-[#38bdf8] hover:to-[#0284c7] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_25px_rgba(0,194,255,0.45)] transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        <span>Iniciar Sesión</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* FORM: REGISTRARSE */
                <form onSubmit={handleCreateAccount} className="relative z-10 space-y-4">
                  {/* Correo Electrónico */}
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                        <Mail size={19} />
                      </div>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="w-full bg-[#07152b] border border-cyan-900/60 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="Correo electrónico"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                        <Lock size={19} />
                      </div>
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-[#07152b] border border-cyan-900/60 rounded-xl py-3.5 pl-11 pr-11 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="Contraseña (mín. 6 caracteres)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                        <Lock size={19} />
                      </div>
                      <input
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-[#07152b] border border-cyan-900/60 rounded-xl py-3.5 pl-11 pr-11 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="Confirmar contraseña"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowRegisterConfirmPassword(!showRegisterConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Primary CTA Button: Registrarse */}
                  <button
                    type="submit"
                    disabled={loading || registerPassword.length < 6}
                    className="w-full bg-gradient-to-r from-[#00d2ff] via-[#00a6fb] to-[#0077b6] hover:from-[#38bdf8] hover:to-[#0284c7] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_25px_rgba(0,194,255,0.45)] transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        <span>Crear Cuenta</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* DIVIDER "o" */}
              <div className="relative z-10 flex items-center my-5">
                <div className="flex-grow border-t border-slate-700/60"></div>
                <span className="flex-shrink mx-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  o
                </span>
                <div className="flex-grow border-t border-slate-700/60"></div>
              </div>

              {/* SOCIAL LOGIN BUTTONS */}
              <div className="relative z-10 space-y-3">
                {/* Continuar con Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={!!socialLoading}
                  className="w-full bg-[#08172e]/90 hover:bg-[#0b2142] border border-slate-700/70 hover:border-cyan-500/60 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  {socialLoading === "google" ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  )}
                  <span>Continuar con Google</span>
                </button>

                {/* Continuar con Apple */}
                <button
                  type="button"
                  onClick={handleAppleLogin}
                  className="w-full bg-[#08172e]/90 hover:bg-[#0b2142] border border-slate-700/70 hover:border-cyan-500/60 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.04-1.79.92-2.84-.91.04-2 .61-2.63 1.35-.55.63-1.03 1.66-.9 2.68 1.02.08 2-.46 2.61-1.19z" />
                  </svg>
                  <span>Continuar con Apple</span>
                </button>
              </div>

              {/* BOTTOM SWITCH LINK */}
              <div className="relative z-10 text-center mt-6 text-xs sm:text-sm text-slate-300">
                {activeTab === "signIn" ? (
                  <p>
                    ¿No tienes una cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      Regístrate ahora <ArrowRight size={14} />
                    </button>
                  </p>
                ) : (
                  <p>
                    ¿Ya tienes una cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signIn")}
                      className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      Inicia sesión <ArrowRight size={14} />
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#040e22] border-2 border-cyan-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,194,255,0.3)]">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetError(null);
                setResetSuccess(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <KeyRound size={22} />
              </div>
              <h2 className="text-xl font-bold text-white">Recuperar Contraseña</h2>
            </div>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              Ingresa el correo electrónico asociado a tu cuenta de NexPlay y te enviaremos
              un enlace seguro para restablecer tu contraseña.
            </p>

            {resetError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-start gap-2 text-xs sm:text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-start gap-2 text-xs sm:text-sm">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full bg-[#07152b] border border-cyan-900/60 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetError(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-[#00b4d8] text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(0,194,255,0.4)] hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Enviar Enlace"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-cyan-400 text-slate-950 font-bold text-sm shadow transition"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
