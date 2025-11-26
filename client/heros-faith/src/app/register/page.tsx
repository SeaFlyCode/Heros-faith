"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import { usersApi, type ApiError } from "@/api";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log('📝 Début de l\'inscription...');
    console.log('Données du formulaire:', { email, username, hasPassword: !!password, hasConfirmPassword: !!confirmPassword, role: 'user' });

    // Validations
    if (!email || !username || !password || !confirmPassword) {
      const missing = [];
      if (!email) missing.push('email');
      if (!username) missing.push('username');
      if (!password) missing.push('password');
      if (!confirmPassword) missing.push('confirmPassword');
      console.log('❌ Champs manquants:', missing);
      setError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }

    // Vérifier que le username n'est pas un email
    if (username.includes('@')) {
      console.log('❌ Le nom d\'utilisateur ne peut pas être un email');
      setError("Le nom d'utilisateur ne peut pas être une adresse email. Utilisez un pseudo.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas');
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      console.log('❌ Mot de passe trop court:', password.length, 'caractères');
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        email,
        username,
        password,
        role: 'user' as const
      };
      console.log('📤 Envoi des données d\'inscription:', { ...userData, password: '***' });

      const response = await usersApi.create(userData);
      console.log('✅ Utilisateur créé avec succès:', response);

      // Connexion automatique après inscription
      console.log('🔐 Connexion automatique...');
      const loginData = await usersApi.login({ email, password });
      console.log('✅ Connexion réussie:', { token: loginData.token.substring(0, 20) + '...', user: loginData.user });

      // Utiliser le hook d'authentification
      authLogin(loginData.token, loginData.user);

      // Redirection vers la page d'accueil
      console.log('➡️ Redirection vers /');
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      console.error('❌ Erreur lors de l\'inscription:', apiError);
      setError(apiError.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background animé Prism avec transition */}
      <PrismTransition
        animationType="rotate"
        timeScale={0.5}
        height={2}
        baseWidth={3}
        targetScale={2}
        hueShift={0}
        colorFrequency={1}
        noise={0.08}
        glow={0.6}
      />

      {/* Bouton retour */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-20 group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-lg text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all duration-300 border border-white/10 hover:border-white/20"
        aria-label="Retour à l'accueil"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm hidden sm:inline">Retour</span>
      </button>

      {/* Formulaire centré */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
                Inscription
              </h1>
              <p className="text-white/60 text-base">
                Créez votre compte pour débuter votre aventure
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 animate-shake">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-200 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Adresse e-mail */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <label htmlFor="email" className="text-lg font-semibold text-white">
                    Email
                  </label>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/10"
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Nom d'utilisateur */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <label htmlFor="username" className="text-lg font-semibold text-white">
                    Nom d&apos;utilisateur
                  </label>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/10"
                  autoComplete="username"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <label htmlFor="password" className="text-lg font-semibold text-white">
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 pr-14 hover:bg-white/10"
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <label htmlFor="confirmPassword" className="text-lg font-semibold text-white">
                    Confirmer mot de passe
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 pr-14 hover:bg-white/10"
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-white hover:bg-white/95 text-gray-900 font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg">Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">S&apos;inscrire</span>
                      <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>

            </form>

            {/* Séparateur */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/50 text-base">
                  Vous avez déjà un compte ?
                </span>
              </div>
            </div>

            {/* Lien connexion */}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="group w-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white font-semibold py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <span className="text-lg">Se connecter</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>
    </div>
  );
}

