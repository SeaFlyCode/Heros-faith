"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Prism from "@/components/Prism";
import { usersApi, type ApiError } from "@/api";

export default function EditProfilePage() {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      console.log('🔍 Initialisation du formulaire avec:', {
        username: user.username,
        email: user.email,
        'sont identiques': user.username === user.email
      });
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    // Validation
    if (!username || !email) {
      setError("Le nom d'utilisateur et l'email sont requis");
      setIsSaving(false);
      return;
    }

    // Vérifier que le username n'est pas un email
    if (username.includes('@')) {
      setError("Le nom d'utilisateur ne peut pas être une adresse email. Utilisez un pseudo.");
      setIsSaving(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      setIsSaving(false);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      setIsSaving(false);
      return;
    }

    try {
      console.log("📤 Mise à jour du profil:", { username, email, hasNewPassword: !!newPassword });
      console.log("🔍 Valeurs des states:", {
        'username state': username,
        'email state': email,
        'username === email': username === email
      });

      // Préparer les données à envoyer
      const updateData: {
        username: string;
        email: string;
        password?: string;
        currentPassword?: string;
      } = {
        username,
        email,
      };

      console.log("📦 Données à envoyer:", JSON.stringify(updateData, null, 2));

      // Vérifier que user existe
      if (!user) {
        setError("Utilisateur non connecté");
        setIsSaving(false);
        return;
      }

      // À ce stade, user n'est jamais null
      const userId = user._id;

      // Ajouter le mot de passe seulement si l'utilisateur veut le changer
      if (newPassword) {
        if (!currentPassword) {
          setError("Le mot de passe actuel est requis pour changer le mot de passe");
          setIsSaving(false);
          return;
        }
        updateData.password = newPassword;
        updateData.currentPassword = currentPassword;
      }

      // Appel API pour mettre à jour le profil
      const updatedUser = await usersApi.update(userId, updateData);
      console.log("✅ Profil mis à jour:", updatedUser);

      // Mettre à jour le localStorage avec les nouvelles données
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Rafraîchir les données dans le hook useAuth
        checkAuth();
      }

      setSuccess("Profil mis à jour avec succès !");

      // Réinitialiser les champs de mot de passe
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors de la mise à jour:", apiError);
      setError(apiError.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background animé Prism */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.08}
          glow={0.6}
        />
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Bouton retour */}
          <button
            onClick={() => router.push("/profile")}
            className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour au profil</span>
          </button>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-12">
            {/* En-tête */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-3">Modifier mon profil</h1>
              <p className="text-white/60">Mettez à jour vos informations personnelles</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur/succès */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-200 text-sm font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-200 text-sm font-medium">{success}</span>
                </div>
              )}

              {/* Photo de profil */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/10">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-4 border-white/20 flex items-center justify-center overflow-hidden">
                  <div className="text-white text-4xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-colors border border-white/20"
                >
                  Changer la photo
                </button>
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
                  required
                />
              </div>

              {/* Email */}
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
                  required
                />
              </div>

              {/* Séparateur */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Changer le mot de passe</h3>
                <p className="text-white/60 text-sm mb-6">Laissez vide si vous ne souhaitez pas changer votre mot de passe</p>
              </div>

              {/* Mot de passe actuel */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <label htmlFor="currentPassword" className="text-lg font-semibold text-white">
                    Mot de passe actuel
                  </label>
                </div>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/10"
                />
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <label htmlFor="newPassword" className="text-lg font-semibold text-white">
                    Nouveau mot de passe
                  </label>
                </div>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/10"
                />
              </div>

              {/* Confirmer nouveau mot de passe */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <label htmlFor="confirmPassword" className="text-lg font-semibold text-white">
                    Confirmer le nouveau mot de passe
                  </label>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/10"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </div>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

