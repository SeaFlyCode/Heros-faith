"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import { 
  storiesApi, 
  storyPagesApi, 
  storyChoicesApi,
  partiesApi,
  ratingsApi,
  getAuthorDisplayName,
  type Story, 
  type StoryPage,
  type StoryChoice,
  type ApiError
} from "@/api";
import { useAuth } from "@/hooks/useAuth";

// Modal de notation
const RatingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  storyTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (rating: number) => void;
  storyTitle: string;
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedRating > 0) {
      setIsSubmitting(true);
      await onSubmit(selectedRating);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Icône */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Félicitations ! 🎉
        </h2>
        <p className="text-white/60 text-center mb-6">
          Vous avez terminé <span className="text-white font-medium">"{storyTitle}"</span>
        </p>

        {/* Question */}
        <p className="text-white text-center mb-4">
          Comment avez-vous trouvé cette histoire ?
        </p>

        {/* Étoiles */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <svg 
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || selectedRating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-600'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Texte du rating */}
        {selectedRating > 0 && (
          <p className="text-center text-white/60 mb-6">
            {selectedRating === 1 && "Pas terrible 😕"}
            {selectedRating === 2 && "Bof 😐"}
            {selectedRating === 3 && "Pas mal 🙂"}
            {selectedRating === 4 && "Super ! 😊"}
            {selectedRating === 5 && "Excellent ! 🤩"}
          </p>
        )}

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium rounded-xl transition-all"
          >
            Passer
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className={`flex-1 px-4 py-3 font-medium rounded-xl transition-all ${
              selectedRating > 0 
                ? 'bg-yellow-500/30 hover:bg-yellow-500/40 border border-yellow-400/50 text-white' 
                : 'bg-gray-700/30 border border-gray-600/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Envoi...' : 'Noter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReadStoryPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // État de l'histoire
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [currentPage, setCurrentPage] = useState<StoryPage | null>(null);
  const [choices, setChoices] = useState<StoryChoice[]>([]);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [partyId, setPartyId] = useState<string | null>(null);
  const partyIdRef = useRef<string | null>(null);
  
  // États UI
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasCompletedEnding, setHasCompletedEnding] = useState(false);

  // Mettre à jour la ref quand partyId change
  useEffect(() => {
    partyIdRef.current = partyId;
  }, [partyId]);

  // Charger les données de l'histoire
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && storyId && user) {
      loadStoryData();
    }
  }, [authLoading, isAuthenticated, storyId, user]);

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

      // Créer ou récupérer une partie pour cette histoire
      if (user) {
        try {
          // Chercher une partie existante non terminée
          const userParties = await partiesApi.getByUserId(user._id);
          
          const existingParty = userParties.find((p: any) => {
            // Gérer le cas où story_id peut être un objet ou une chaîne
            const partyStoryId = typeof p.story_id === 'object' ? p.story_id._id : p.story_id;
            return partyStoryId === storyId && !p.end_date;
          });

          if (existingParty) {
            setPartyId(existingParty._id);
          } else {
            // Créer une nouvelle partie
            const newParty = await partiesApi.create({
              user_id: user._id,
              story_id: storyId,
            });
            setPartyId(newParty._id);
          }
        } catch (err) {
          console.error("Erreur lors de la gestion de la partie:", err);
        }
      }

      // Trouver la première page (celle qui n'est la cible d'aucun choix = page de départ)
      if (pagesData.length > 0) {
        const firstPage = await findFirstPage(pagesData);
        if (firstPage) {
          await navigateToPage(firstPage._id, pagesData);
        } else {
          setError("Aucune page de départ trouvée pour cette histoire");
        }
      } else {
        setError("Cette histoire n'a pas encore de pages");
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
  const findFirstPage = async (pagesData: StoryPage[]): Promise<StoryPage | null> => {
    if (pagesData.length === 0) return null;

    try {
      // Charger tous les choix pour toutes les pages
      const allChoicesPromises = pagesData.map(page =>
        storyChoicesApi.getByPageId(page._id).catch(() => [])
      );
      const allChoicesArrays = await Promise.all(allChoicesPromises);
      const allChoices = allChoicesArrays.flat();

      console.log(`📋 Total de choix dans l'histoire: ${allChoices.length}`);

      // Trouver les IDs de toutes les pages ciblées
      const targetedPageIds = new Set(
        allChoices
          .map(choice => choice.target_page_id)
          .filter(id => id) // Filtrer les undefined/null
      );

      // La première page est celle qui n'est ciblée par aucun choix
      const firstPage = pagesData.find(page => !targetedPageIds.has(page._id));

      if (firstPage) {
        console.log(`🏁 Page racine trouvée: ${firstPage._id}`);
        return firstPage;
      }

      // Fallback: si aucune page racine n'est trouvée, prendre la première
      console.warn("⚠️ Aucune page racine trouvée, utilisation de la première page");
      return pagesData[0];
    } catch (err) {
      console.error("❌ Erreur lors de la recherche de la première page:", err);
      return pagesData[0];
    }
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
        const pageChoices = await storyChoicesApi.getByPageId(pageId);
        console.log(`📋 Choix chargés pour la page ${pageId}:`, pageChoices.length);
        setChoices(pageChoices);
      } else {
        setChoices([]);
        // C'est une page de fin - marquer la partie comme terminée et afficher le modal
        if (!hasCompletedEnding) {
          await handleEndingReached();
        }
      }

      // Petit délai pour l'animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

    } catch (err) {
      console.error("❌ Erreur lors de la navigation:", err);
      setIsTransitioning(false);
    }
  }, [pages, hasCompletedEnding]);

  // Gérer l'arrivée à une fin
  const handleEndingReached = async () => {
    try {
      // Marquer la partie comme terminée
      if (partyIdRef.current) {
        await partiesApi.update(partyIdRef.current, {
          end_date: new Date().toISOString(),
        });
      }
      
      setHasCompletedEnding(true);
      // Afficher le modal de notation après un court délai
      setTimeout(() => {
        setShowRatingModal(true);
      }, 1000);
    } catch (err) {
      console.error("Erreur lors de la fin de partie:", err);
    }
  };

  // Soumettre la notation
  const handleRatingSubmit = async (rating: number) => {
    try {
      if (user && storyId) {
        await ratingsApi.create({
          user_id: user._id,
          story_id: storyId,
          rating: rating,
        });
        console.log("✅ Note enregistrée:", rating);
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de la note:", err);
    } finally {
      setShowRatingModal(false);
    }
  };

  // Gérer le choix d'une option
  const handleChoice = (choice: StoryChoice) => {
    console.log("🎯 Choix sélectionné:", choice.text);
    if (choice.target_page_id) {
      navigateToPage(choice.target_page_id);
    } else {
      console.error("❌ Ce choix n'a pas de page cible");
      setError("Ce choix n'est pas encore développé");
    }
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
  const handleRestart = async () => {
    setPageHistory([]);
    if (pages.length > 0) {
      const firstPage = await findFirstPage(pages);
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

      {/* Modal de notation */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        storyTitle={story?.title || "cette histoire"}
      />
    </div>
  );
}
