"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import { 
  storiesApi, 
  storyPagesApi, 
  choicesApi,
  getAuthorDisplayName,
  type Story, 
  type StoryPage,
  type Choice,
  type ApiError 
} from "@/api";
import { useAuth } from "@/hooks/useAuth";

export default function ReadStoryPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // État de l'histoire
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [currentPage, setCurrentPage] = useState<StoryPage | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  
  // États UI
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState("");

  // Charger les données de l'histoire
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && storyId) {
      loadStoryData();
    }
  }, [authLoading, isAuthenticated, storyId]);

  const loadStoryData = async () => {
    try {
      setIsLoading(true);
      console.log("📖 Chargement de l'histoire:", storyId);

      // Charger l'histoire
      const storyData = await storiesApi.getById(storyId);
      setStory(storyData);
      console.log("✅ Histoire chargée:", storyData.title);

      // Charger toutes les pages de l'histoire
      const pagesData = await storyPagesApi.getByStoryId(storyId);
      setPages(pagesData);
      console.log("✅ Pages chargées:", pagesData.length);

      // Trouver la première page (celle qui n'est la cible d'aucun choix = page de départ)
      if (pagesData.length > 0) {
        const firstPage = findFirstPage(pagesData);
        if (firstPage) {
          await navigateToPage(firstPage._id, pagesData);
        }
      }

      setError("");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors du chargement:", apiError);
      setError(apiError.message || "Erreur lors du chargement de l'histoire");
    } finally {
      setIsLoading(false);
    }
  };

  // Trouver la première page (celle qui n'est ciblée par aucun choix)
  const findFirstPage = (pagesData: StoryPage[]): StoryPage | null => {
    // Pour l'instant, on prend simplement la première page
    // Une meilleure logique serait de charger tous les choix et trouver la page non ciblée
    return pagesData[0] || null;
  };

  // Naviguer vers une page
  const navigateToPage = useCallback(async (pageId: string, pagesData?: StoryPage[]) => {
    try {
      setIsTransitioning(true);
      
      const allPages = pagesData || pages;
      const page = allPages.find(p => p._id === pageId);
      
      if (!page) {
        console.error("❌ Page non trouvée:", pageId);
        return;
      }

      console.log("📄 Navigation vers la page:", pageId);
      setCurrentPage(page);

      // Ajouter à l'historique
      setPageHistory(prev => [...prev, pageId]);

      // Charger les choix de cette page
      if (!page.is_ending) {
        const pageChoices = await choicesApi.getByPageId(pageId);
        setChoices(pageChoices);
        console.log("✅ Choix chargés:", pageChoices.length);
      } else {
        setChoices([]);
      }

      // Petit délai pour l'animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

    } catch (err) {
      console.error("❌ Erreur lors de la navigation:", err);
      setIsTransitioning(false);
    }
  }, [pages]);

  // Gérer le choix d'une option
  const handleChoice = (choice: Choice) => {
    console.log("🎯 Choix sélectionné:", choice.text);
    navigateToPage(choice.target_page_id);
  };

  // Revenir à la page précédente
  const handleGoBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Retirer la page actuelle
      const previousPageId = newHistory[newHistory.length - 1];
      setPageHistory(newHistory.slice(0, -1)); // Retirer aussi la précédente car navigateToPage va l'ajouter
      navigateToPage(previousPageId);
    }
  };

  // Recommencer l'histoire
  const handleRestart = () => {
    setPageHistory([]);
    if (pages.length > 0) {
      const firstPage = findFirstPage(pages);
      if (firstPage) {
        navigateToPage(firstPage._id);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white/60 text-lg">Chargement de l'histoire...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center max-w-md px-4">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-white text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.push("/read")}
            className="px-6 py-3 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Retour aux histoires
          </button>
        </div>
      </div>
    );
  }

  if (!story || !currentPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center max-w-md px-4">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-white text-2xl font-bold mb-2">Histoire vide</h2>
          <p className="text-white/60 mb-6">Cette histoire n'a pas encore de contenu.</p>
          <button
            onClick={() => router.push("/read")}
            className="px-6 py-3 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Retour aux histoires
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background animé Prism */}
      <div className="fixed inset-0 z-0">
        <PrismTransition
          animationType="rotate"
          timeScale={0.3}
          height={2}
          baseWidth={3}
          targetScale={2}
          hueShift={currentPage.is_ending ? 60 : 0}
          colorFrequency={1}
          noise={0.05}
          glow={0.6}
        />
      </div>

      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Bouton retour */}
          <button
            onClick={() => router.push("/read")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Quitter</span>
          </button>

          {/* Titre de l'histoire */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-white font-bold text-lg truncate">{story.title}</h1>
            <p className="text-white/50 text-sm">Par {getAuthorDisplayName(story.author)}</p>
          </div>

          {/* Progression */}
          <div className="text-white/50 text-sm">
            Page {pageHistory.length}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 min-h-screen pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Carte du contenu */}
          <div 
            className={`bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-500 ${
              isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
            }`}
          >
            {/* Illustration (si présente) */}
            {currentPage.illustration && (
              <div className="w-full h-64 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center">
                <img 
                  src={currentPage.illustration} 
                  alt="Illustration" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Contenu de la page */}
            <div className="p-8 sm:p-12">
              {/* Badge de fin si c'est une page de fin */}
              {currentPage.is_ending && (
                <div className="mb-6 flex items-center justify-center">
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 text-yellow-300 text-sm font-medium rounded-full">
                    {currentPage.ending_label || "Fin de l'histoire"}
                  </span>
                </div>
              )}

              {/* Texte du contenu */}
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                  {currentPage.content}
                </p>
              </div>

              {/* Séparateur */}
              {(choices.length > 0 || currentPage.is_ending) && (
                <div className="my-8 border-t border-white/10"></div>
              )}

              {/* Choix disponibles */}
              {!currentPage.is_ending && choices.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">
                    Que faites-vous ?
                  </h3>
                  {choices.map((choice, index) => (
                    <button
                      key={choice._id}
                      onClick={() => handleChoice(choice)}
                      className="group w-full text-left p-5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-bold group-hover:bg-cyan-500/40 transition-colors">
                          {index + 1}
                        </span>
                        <span className="text-white group-hover:text-cyan-100 transition-colors">
                          {choice.text}
                        </span>
                        <svg className="w-5 h-5 text-white/30 group-hover:text-cyan-400 ml-auto transition-all group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Message si pas de choix et pas une fin */}
              {!currentPage.is_ending && choices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/50 italic">Cette page n'a pas encore de suite...</p>
                </div>
              )}

              {/* Actions de fin */}
              {currentPage.is_ending && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleRestart}
                    className="w-full sm:w-auto px-8 py-4 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Recommencer
                  </button>
                  <button
                    onClick={() => router.push("/read")}
                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Autres histoires
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bouton retour arrière (si pas sur la première page) */}
          {pageHistory.length > 1 && !currentPage.is_ending && (
            <div className="mt-6 text-center">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Revenir en arrière
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
