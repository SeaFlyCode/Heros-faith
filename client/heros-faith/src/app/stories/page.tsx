"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import { storiesApi, type Story } from "@/api";
import { useAuth } from "@/hooks/useAuth";
export default function StoriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated && user) {
      loadStories();
    }
  }, [authLoading, isAuthenticated, user, router]);
  const loadStories = async () => {
    try {
      setIsLoading(true);
      console.log("📚 Chargement des histoires...");
      const allStories = await storiesApi.getAll();
      console.log("✅ Histoires récupérées:", allStories);
      const userStories = allStories.filter(story => story.author === user?._id);
      console.log("📖 Histoires de l'utilisateur:", userStories);
      setStories(userStories);
      setError("");
    } catch (err) {
      console.error("❌ Erreur lors du chargement des histoires:", err);
      setError("Erreur lors du chargement des histoires");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditStory = (id: string) => {
    router.push(`/stories/write?storyId=${id}`);
  };
  const handleCreateStory = () => {
    router.push("/stories/new");
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
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
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
      <main className="relative z-20 min-h-screen pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12 font-montserrat tracking-tight">
            Mes Histoires
          </h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-200 text-sm font-medium">{error}</span>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-12 max-w-2xl w-full text-center">
                <svg className="w-24 h-24 text-cyan-400/50 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 className="text-3xl font-bold text-white mb-4 font-montserrat">
                  Aucune histoire pour le moment
                </h2>
                <p className="text-white/60 text-lg mb-8">
                  Créez votre première histoire et donnez vie à votre imagination !
                </p>
                <button
                  onClick={handleCreateStory}
                  className="group inline-flex items-center gap-3 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.05]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-lg">Créer ma première histoire</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {stories.map((story) => (
                  <div key={story._id} className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="relative w-full h-52 flex items-center justify-center p-6">
                      <button onClick={(e) => { e.stopPropagation(); handleEditStory(story._id); }} className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-2.5 rounded-full transition-all duration-200 border border-white/10 hover:border-cyan-400/50 group/btn z-10" aria-label={`Éditer ${story.title}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white group-hover/btn:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <h2 className="text-2xl font-semibold text-white font-montserrat text-center group-hover:text-cyan-400 transition-colors">
                        {story.title}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <button onClick={handleCreateStory} className="group relative w-full max-w-2xl bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]">
                  <div className="relative flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-lg">Créer une nouvelle histoire</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
