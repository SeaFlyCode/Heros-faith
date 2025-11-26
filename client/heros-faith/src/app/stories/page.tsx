"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Prism from "@/components/Prism";

interface Story {
  id: number;
  title: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const [stories] = useState<Story[]>([
    { id: 1, title: "Histoire 1" },
    { id: 2, title: "Histoire 2" },
    { id: 3, title: "Histoire 3" },
    { id: 4, title: "Histoire 4" },
    { id: 5, title: "Histoire 5" },
    { id: 6, title: "Histoire 6" },
  ]);

  const handleEditStory = (id: number) => {
    // Navigation vers la page d'édition de l'histoire
    router.push(`/stories/${id}/edit`);
  };

  const handleCreateStory = () => {
    // Navigation vers la page de création d'une nouvelle histoire
    router.push("/stories/new");
  };

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
          glow={0.8}
        />
        {/* Overlay noir pour renforcer le fond noir */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />
      </div>

      {/* Contenu principal */}
      <main className="relative z-20 min-h-screen pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Titre de la page */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12 font-montserrat tracking-tight">
            Mes Histoires
          </h1>

          {/* Grille des histoires */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full h-52 flex items-center justify-center p-6">
                  {/* Icône d'édition */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStory(story.id);
                    }}
                    className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-2.5 rounded-full transition-all duration-200 border border-white/10 hover:border-purple-400/50 group/btn z-10"
                    aria-label={`Éditer ${story.title}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white group-hover/btn:text-purple-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  {/* Titre de l'histoire */}
                  <h2 className="text-2xl font-semibold text-white font-montserrat text-center group-hover:text-purple-300 transition-colors">
                    {story.title}
                  </h2>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton créer une nouvelle histoire */}
          <div className="flex justify-center">
            <button
              onClick={handleCreateStory}
              className="group relative w-full max-w-2xl bg-white hover:bg-white/95 text-gray-900 font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-lg">Créer une nouvelle histoire !!!</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

