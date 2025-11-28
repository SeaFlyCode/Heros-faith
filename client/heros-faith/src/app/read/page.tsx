"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import { storiesApi, partiesApi, ratingsApi, type Story, type ApiError } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { getCoverImageUrl } from "@/utils/imageUrl";

// Interface pour les histoires enrichies avec progression et rating
interface EnrichedStory extends Story {
  progress?: number;
  averageRating?: number;
  totalRatings?: number;
  genre?: string;
  partyId?: string;
}

// Composant pour une vignette d'histoire
const StoryCard = ({ story, showProgress = false }: { story: EnrichedStory; showProgress?: boolean }) => {
  const router = useRouter();

  const handleStoryClick = (storyId: string) => {
    router.push(`/read/${storyId}`);
  };

  // Construire l'URL complète de l'image
  const coverImageUrl = getCoverImageUrl(story.coverImage);

  return (
    <div
      onClick={() => handleStoryClick(story._id)}
      className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
    >
      {/* Image de couverture */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-white/10">
        {coverImageUrl ? (
          /* Image de couverture réelle */
          <img
            src={coverImageUrl}
            alt={`Couverture de ${story.title}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder si pas d'image */
          <div className="absolute inset-0 flex items-center justify-center text-white/30">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white/90 text-sm line-clamp-3">{story.description || "Aucune description"}</p>
          </div>
        </div>

        {/* Badge genre */}
        {story.genre && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
              {story.genre}
            </span>
          </div>
        )}

        {/* Rating */}
        {story.averageRating !== undefined && story.averageRating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
            <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs">{story.averageRating.toFixed(1)}</span>
            {story.totalRatings !== undefined && story.totalRatings > 0 && (
              <span className="text-white/60 text-xs">({story.totalRatings})</span>
            )}
          </div>
        )}

        {/* Barre de progression */}
        {showProgress && story.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${story.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="mt-3 space-y-1">
        <h3 className="text-white font-semibold text-base group-hover:text-cyan-400 transition-colors line-clamp-1">
          {story.title}
        </h3>
        <p className="text-white/60 text-sm line-clamp-1">
          Par {typeof story.author === 'object' && story.author !== null 
            ? (story.author as { username?: string }).username || 'Anonyme'
            : story.author || 'Anonyme'}
        </p>
        {showProgress && story.progress !== undefined && (
          <p className="text-cyan-400 text-xs font-medium">{story.progress}% complété</p>
        )}
      </div>
    </div>
  );
};

// Composant pour une section de stories
const StorySection = ({
  title,
  stories,
  showProgress = false,
  isLoading = false,
}: {
  title: string;
  stories: EnrichedStory[];
  showProgress?: boolean;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-white text-2xl font-bold mb-6 px-4 sm:px-8">{title}</h2>
        <div className="px-4 sm:px-8">
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-white text-2xl font-bold mb-6 px-4 sm:px-8">{title}</h2>
      <div className="px-4 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {stories.map((story) => (
            <StoryCard key={story._id} story={story} showProgress={showProgress} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function ReadPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [continueReading, setContinueReading] = useState<EnrichedStory[]>([]);
  const [trending, setTrending] = useState<EnrichedStory[]>([]);
  const [publishedStories, setPublishedStories] = useState<EnrichedStory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user) {
      loadData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log("📚 Chargement des histoires...");

      // 1. Charger uniquement les histoires publiées
      const allStories = await storiesApi.getAll();
      const publishedStories = allStories.filter(story => story.status === 'published');

      console.log("✅ Histoires publiées:", publishedStories.length);
      console.log("📊 Total histoires:", allStories.length, "dont", allStories.length - publishedStories.length, "brouillons");

      // 2. Enrichir les histoires avec les ratings
      const enrichedStories = await Promise.all(
        publishedStories.map(async (story) => {
          try {
            const ratingData = await ratingsApi.getStoryAverage(story._id);
            return {
              ...story,
              averageRating: ratingData.averageRating,
              totalRatings: ratingData.totalRatings,
            } as EnrichedStory;
          } catch (err) {
            // Si pas de ratings, retourner l'histoire sans
            return {
              ...story,
              averageRating: 0,
              totalRatings: 0,
            } as EnrichedStory;
          }
        })
      );

      // 3. Charger les parties de l'utilisateur pour la progression
      let userParties: any[] = [];
      try {
        userParties = await partiesApi.getByUserId(user!._id);
        console.log("✅ Parties de l'utilisateur:", userParties.length);
      } catch (err) {
        console.log("Aucune partie trouvée");
      }

      // 4. Enrichir toutes les histoires avec la progression de l'utilisateur
      const progressMap = new Map<string, { progress: number; partyId: string; startDate: Date }>();
      const storiesInProgressMap = new Map<string, EnrichedStory>();

      for (const party of userParties) {
        const storyId = typeof party.story_id === 'object'
          ? (party.story_id as any)._id
          : party.story_id;

        try {
          const progressData = await partiesApi.getProgress(party._id);

          // Stocker la progression pour chaque histoire (garder la plus récente)
          const existingProgress = progressMap.get(storyId);
          const partyStartDate = new Date(party.start_date);

          if (!existingProgress || partyStartDate > existingProgress.startDate) {
            progressMap.set(storyId, {
              progress: progressData.progress,
              partyId: party._id,
              startDate: partyStartDate,
            });

            // Ajouter à "Continuer à lire" si non terminé ET si progress > 0
            if (!party.end_date && progressData.progress > 0) {
              const story = enrichedStories.find(s => s._id === storyId);
              if (story) {
                storiesInProgressMap.set(storyId, {
                  ...story,
                  progress: progressData.progress,
                  partyId: party._id,
                });
              }
            }
          }
        } catch (err) {
          console.error("Erreur lors du chargement de la progression", err);
        }
      }

      // Convertir la Map en Array pour "Continuer à lire"
      setContinueReading(Array.from(storiesInProgressMap.values()));

      // 5. Appliquer la progression à toutes les histoires
      const storiesWithProgress = enrichedStories.map(story => {
        const progressInfo = progressMap.get(story._id);
        return progressInfo && progressInfo.progress > 0
          ? { ...story, progress: progressInfo.progress, partyId: progressInfo.partyId }
          : story;
      });

      // 6. Trier par rating pour les tendances (top 10)
      const sortedByRating = [...storiesWithProgress].sort((a, b) => {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return ratingB - ratingA;
      });
      setTrending(sortedByRating.slice(0, 10));

      // 7. Toutes les histoires publiées avec progression
      setPublishedStories(storiesWithProgress);

      setError("");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors du chargement:", apiError);
      setError(apiError.message || "Erreur lors du chargement des histoires");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les histoires par recherche
  const filteredStories = searchQuery.trim()
    ? publishedStories.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

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
    <div className="relative min-h-screen w-full bg-black">
      {/* Background animé Prism avec transition */}
      <div className="fixed inset-0 z-0">
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
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 min-h-screen pt-32 pb-16">
        {/* Header avec titre et recherche */}
        <div className="px-4 sm:px-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-montserrat tracking-tight">
              Lire les histoires
            </h1>

            {/* Barre de recherche */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher une histoire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 px-5 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="px-4 sm:px-8 mb-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-200 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Affichage des résultats de recherche */}
        {filteredStories ? (
          <StorySection
            title={`Résultats de recherche (${filteredStories.length})`}
            stories={filteredStories}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Section Continuer à lire */}
            <StorySection
              title="Continuer à lire..."
              stories={continueReading}
              showProgress={true}
              isLoading={isLoading}
            />

            {/* Section Tendances */}
            <StorySection
              title="Tendances"
              stories={trending}
              isLoading={isLoading}
            />

            {/* Section Toutes les histoires */}
            {!isLoading && publishedStories.length > 0 && (
              <StorySection
                title="Toutes les histoires"
                stories={publishedStories}
              />
            )}

            {/* Message si aucune histoire */}
            {!isLoading && publishedStories.length === 0 && (
              <div className="px-4 sm:px-8">
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-12 text-center">
                  <svg className="w-24 h-24 text-cyan-400/50 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Aucune histoire disponible
                  </h2>
                  <p className="text-white/60 text-lg">
                    Revenez plus tard pour découvrir de nouvelles histoires !
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

