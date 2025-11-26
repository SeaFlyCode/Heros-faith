"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";

// Types pour les histoires
interface Story {
  id: number;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  progress?: number; // Pourcentage de progression (0-100)
  genre: string;
  rating: number;
}

// Composant pour une vignette d'histoire
const StoryCard = ({ story, showProgress = false }: { story: Story; showProgress?: boolean }) => {
  const router = useRouter();

  const handleStoryClick = (storyId: number) => {
    router.push(`/read/${storyId}`);
  };

  return (
    <div
      onClick={() => handleStoryClick(story.id)}
      className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
    >
      {/* Image de couverture */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-white/10">
        {/* Placeholder pour l'image */}
        <div className="absolute inset-0 flex items-center justify-center text-white/30">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white/90 text-sm line-clamp-3">{story.description}</p>
          </div>
        </div>

        {/* Badge genre */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
            {story.genre}
          </span>
        </div>

        {/* Rating */}
        {story.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
            <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs">{story.rating.toFixed(1)}</span>
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
        <p className="text-white/60 text-sm">{story.author}</p>
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
}: {
  title: string;
  stories: Story[];
  showProgress?: boolean;
}) => (
  <section className="mb-12">
    <h2 className="text-white text-2xl font-bold mb-6 px-4 sm:px-8">{title}</h2>
    <div className="px-4 sm:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} showProgress={showProgress} />
        ))}
      </div>
    </div>
  </section>
);

export default function ReadPage() {
  // Données mockées pour l'exemple
  const [continueReading] = useState<Story[]>([
    {
      id: 1,
      title: "L'Épée de Lumière",
      author: "Jean Dupont",
      description: "Une aventure épique dans un monde de magie et de mystère...",
      thumbnail: "/api/placeholder/400/600",
      progress: 45,
      genre: "Fantasy",
      rating: 4.5,
    },
    {
      id: 2,
      title: "Les Ombres du Passé",
      author: "Marie Martin",
      description: "Un thriller psychologique captivant...",
      thumbnail: "/api/placeholder/400/600",
      progress: 78,
      genre: "Thriller",
      rating: 4.8,
    },
    {
      id: 3,
      title: "Le Dernier Royaume",
      author: "Pierre Dubois",
      description: "Dans un royaume en guerre, un héros doit se lever...",
      thumbnail: "/api/placeholder/400/600",
      progress: 23,
      genre: "Fantasy",
      rating: 4.3,
    },
  ]);

  const [trending] = useState<Story[]>([
    {
      id: 4,
      title: "Chroniques Galactiques",
      author: "Sophie Laurent",
      description: "Une odyssée spatiale palpitante...",
      thumbnail: "/api/placeholder/400/600",
      genre: "Science-Fiction",
      rating: 4.9,
    },
    {
      id: 5,
      title: "Le Grimoire Interdit",
      author: "Luc Moreau",
      description: "Magie noire et secrets ancestraux...",
      thumbnail: "/api/placeholder/400/600",
      genre: "Fantasy",
      rating: 4.7,
    },
    {
      id: 6,
      title: "Néon Cyberpunk",
      author: "Emma Chen",
      description: "Dans une ville du futur, la technologie règne...",
      thumbnail: "/api/placeholder/400/600",
      genre: "Cyberpunk",
      rating: 4.6,
    },
    {
      id: 7,
      title: "Les Gardiens du Temps",
      author: "Thomas Bernard",
      description: "Voyages temporels et paradoxes...",
      thumbnail: "/api/placeholder/400/600",
      genre: "Science-Fiction",
      rating: 4.8,
    },
  ]);

  const [myStories] = useState<Story[]>([
    {
      id: 8,
      title: "Mon Histoire 1",
      author: "Vous",
      description: "Votre première création...",
      thumbnail: "/api/placeholder/400/600",
      genre: "Aventure",
      rating: 0,
    },
    {
      id: 9,
      title: "Mon Histoire 2",
      author: "Vous",
      description: "Une histoire en cours...",
      thumbnail: "/api/placeholder/400/600",
      genre: "Fantasy",
      rating: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

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

        {/* Section Continuer à lire */}
        {continueReading.length > 0 && (
          <StorySection title="Continuer à lire..." stories={continueReading} showProgress={true} />
        )}

        {/* Section Tendances */}
        <StorySection title="Tendances" stories={trending} />

        {/* Section Mes histoires */}
        <StorySection title="Mes histoires" stories={myStories} />
      </main>
    </div>
  );
}

