"use client";

import { useState } from "react";
import GlassSurface from "@/components/GlassSurface";
import Prism from "@/components/Prism";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    alert(`Connexion avec : ${email}`);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center ">
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
          glow={0.2}
        />
      </div>
      {/* Bouton retour */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 z-20 bg-white/80 hover:bg-white text-black font-semibold px-4 py-1 rounded shadow transition-colors border border-black/10"
        aria-label="Retour"
      >
        ← Retour
      </button>
      {/* Formulaire centré dans une box glass */}
      <div className="relative z-10 flex items-center justify-center w-full min-h-screen">
        <GlassSurface
          borderRadius={28}
          blur={16}
          opacity={0.92}
          brightness={30}
          borderWidth={0.1}
          backgroundOpacity={0.25}
          mixBlendMode="screen"
          className="flex flex-col items-stretch shadow-2xl p-10 min-w-[400px] max-w-md min-h-[480px]"
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-start gap-6 px-2"
          >
            <h2 className="text-2xl font-bold text-center mb-8 mt-0">Connexion</h2>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white/80"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-medium">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white/80"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-yellow-400 text-white font-semibold py-2 rounded transition-colors shadow-lg text-lg tracking-wide border border-neutral-700"
            >
              Se connecter
            </button>
          </form>
        </GlassSurface>
      </div>
    </div>
  );
}
