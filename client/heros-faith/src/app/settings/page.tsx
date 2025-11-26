"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Prism from "@/components/Prism";

export default function SettingsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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
      <div className="relative z-10 pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-12">
            <h1 className="text-4xl font-bold text-white mb-8">Paramètres</h1>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Général</h2>
                <p className="text-white/60">Paramètres généraux du compte</p>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Sécurité</h2>
                <p className="text-white/60">Modifier votre mot de passe</p>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
                <p className="text-white/60">Gérer vos notifications</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-white/60 text-center">
                Page de paramètres en construction...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

