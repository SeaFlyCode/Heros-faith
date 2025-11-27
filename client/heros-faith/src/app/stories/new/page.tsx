"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import { storiesApi, type ApiError } from "@/api";
import { useAuth } from "@/hooks/useAuth";

export default function NewStoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      // Vérifier le type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Format d'image non supporté. Utilisez JPEG, PNG, GIF ou WebP.");
        return;
      }

      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    if (!description.trim()) {
      setError("La description est requise");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Création d'une nouvelle histoire...");

      const newStory = await storiesApi.create({
        title: title.trim(),
        description: description.trim(),
        status: 'draft'
      });

      console.log("Histoire créée avec succès:", newStory);

      // Upload de l'image si présente
      if (coverImage) {
        console.log("Upload de l'image de couverture...");
        await storiesApi.uploadCoverImage(newStory._id, coverImage);
        console.log("Image uploadée avec succès");
      }

      // Rediriger vers la page write avec l'ID de l'histoire
      router.push(`/stories/write?storyId=${newStory._id}`);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Erreur lors de la création de l'histoire:", apiError);
      setError(apiError.message || "Erreur lors de la création de l'histoire");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      <PrismTransition
        animationType="rotate"
        timeScale={0.5}
        height={2}
        baseWidth={3}
        targetScale={2}
        hueShift={0}
        colorFrequency={1}
        noise={0.08}
        glow={0.8}
      />

      <button
        type="button"
        onClick={() => router.push("/stories")}
        className="absolute top-6 left-6 z-20 group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-lg text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all duration-300 border border-white/10 hover:border-white/20"
        aria-label="Retour à mes histoires"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm hidden sm:inline">Retour</span>
      </button>

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                Crée une histoire
              </h1>
              <p className="text-white/60 text-xs">
                Laissez libre cours à votre imagination
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-200 text-xs font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <label htmlFor="title" className="text-sm font-semibold text-white">Titre</label>
                </div>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de votre histoire..."
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:bg-white/10"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <label htmlFor="description" className="text-sm font-semibold text-white">Description</label>
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre histoire..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:bg-white/10 resize-none"
                  required
                />
              </div>

              {/* Image de couverture */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <label htmlFor="coverImage" className="text-sm font-semibold text-white">Image</label>
                  <span className="text-white/40 text-xs">(optionnel)</span>
                </div>
                
                {coverImagePreview ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={coverImagePreview}
                      alt="Aperçu de la couverture"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="coverImage"
                    className="flex flex-col items-center justify-center w-full h-20 bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <svg className="w-6 h-6 text-white/40 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-white/40 text-xs">Cliquez pour ajouter une image</span>
                  </label>
                )}
                <input
                  ref={fileInputRef}
                  id="coverImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Créer l'histoire</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

