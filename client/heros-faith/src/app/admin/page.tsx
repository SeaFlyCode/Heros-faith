"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storiesApi, reportsApi, usersApi, getAuthorDisplayName, type Story, type Report, type User } from "@/api";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [stories, setStories] = useState<Story[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "censored">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"stories" | "reports" | "users">("stories");

  // Modal de censure
  const [showCensorModal, setShowCensorModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [censorReason, setCensorReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  // Modal de suppression d'utilisateur
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Vérifier l'authentification et le rôle admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (user?.role !== "admin") {
        router.push("/");
        return;
      }
      loadData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Vérifier si le token contient le rôle en décodant le JWT
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem('token');
      if (token && user?.role === 'admin') {
        try {
          // Décoder le token JWT (partie payload)
          const payload = JSON.parse(atob(token.split('.')[1]));

          // Si le token n'a pas de rôle, forcer la reconnexion
          if (!payload.role) {
            console.warn('⚠️ Token JWT sans rôle détecté. Reconnexion requise.');
            setError("Votre session doit être mise à jour. Reconnexion en cours...");
            setTimeout(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login?message=session_expired');
            }, 1500);
          }
        } catch (e) {
          console.error('❌ Erreur lors de la vérification du token:', e);
        }
      }
    };

    checkTokenValidity();
  }, [user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storiesData, reportsData, usersData] = await Promise.all([
        storiesApi.getAllAdmin(),
        reportsApi.getAll(),
        usersApi.getAll(),
      ]);
      setStories(storiesData);
      setReports(reportsData);
      setUsers(usersData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des données";

      // Si l'erreur concerne le rôle manquant, forcer la reconnexion
      if (errorMessage.includes("rôle manquant") || errorMessage.includes("Accès refusé")) {
        setError("Votre session est expirée ou invalide. Veuillez vous reconnecter.");
        // Déconnexion automatique après 2 secondes
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les histoires
  const filteredStories = stories.filter((story) => {
    // Filtre par statut
    if (filter === "published" && story.status !== "published") return false;
    if (filter === "censored" && !story.censorship?.censored) return false;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = story.title.toLowerCase();
      const author = getAuthorDisplayName(story.author).toLowerCase();
      if (!title.includes(query) && !author.includes(query)) return false;
    }

    return true;
  });

  // Ouvrir le modal de censure
  const openCensorModal = (story: Story) => {
    setSelectedStory(story);
    setCensorReason("");
    setShowCensorModal(true);
  };

  // Censurer une histoire
  const handleCensor = async () => {
    if (!selectedStory) return;

    try {
      setIsProcessing(true);
      await storiesApi.censor(selectedStory._id, censorReason);
      
      // Mettre à jour la liste
      setStories(stories.map(s => 
        s._id === selectedStory._id 
          ? { ...s, censorship: { censored: true, reason: censorReason, censorshipDate: new Date().toISOString() } }
          : s
      ));
      
      setShowCensorModal(false);
      setSelectedStory(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la censure");
    } finally {
      setIsProcessing(false);
    }
  };

  // Lever la censure
  const handleUncensor = async (story: Story) => {
    try {
      setIsProcessing(true);
      await storiesApi.uncensor(story._id);
      
      // Mettre à jour la liste
      setStories(stories.map(s => 
        s._id === story._id 
          ? { ...s, censorship: { censored: false } }
          : s
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la levée de censure");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ouvrir la modal de suppression
  const openDeleteModal = (story: Story) => {
    setStoryToDelete(story);
    setShowDeleteModal(true);
  };

  // Supprimer une histoire
  const handleDelete = async () => {
    if (!storyToDelete) return;

    try {
      setIsProcessing(true);
      await storiesApi.delete(storyToDelete._id);

      // Retirer de la liste
      setStories(stories.filter(s => s._id !== storyToDelete._id));

      setShowDeleteModal(false);
      setStoryToDelete(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setIsProcessing(false);
    }
  };

  // Supprimer un signalement
  const handleDeleteReport = async (reportId: string) => {
    try {
      await reportsApi.delete(reportId);
      setReports(reports.filter(r => r._id !== reportId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression du signalement");
    }
  };

  // Ouvrir la modal de suppression d'utilisateur
  const openDeleteUserModal = (userItem: User) => {
    setUserToDelete(userItem);
    setShowDeleteUserModal(true);
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsProcessing(true);
      await usersApi.delete(userToDelete._id);

      // Retirer de la liste
      setUsers(users.filter(u => u._id !== userToDelete._id));

      setShowDeleteUserModal(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Censurer depuis un signalement
  const handleCensorFromReport = async (report: Report) => {
    const storyId = typeof report.story_id === 'object' ? report.story_id._id : report.story_id;
    const story = stories.find(s => s._id === storyId);
    if (story) {
      openCensorModal(story);
    }
  };

  // Helper pour obtenir les infos du signalement
  const getReportStoryTitle = (report: Report): string => {
    if (typeof report.story_id === 'object' && report.story_id !== null) {
      return report.story_id.title;
    }
    return "Histoire inconnue";
  };

  const getReportUserName = (report: Report): string => {
    if (typeof report.user_id === 'object' && report.user_id !== null) {
      return report.user_id.username;
    }
    return "Utilisateur inconnu";
  };

  const getReportStoryId = (report: Report): string => {
    if (typeof report.story_id === 'object' && report.story_id !== null) {
      return report.story_id._id;
    }
    return report.story_id as string;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white/60 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Administration
          </h1>
          <p className="text-white/50 mt-1">Gestion des histoires et signalements</p>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === "stories"
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            } border`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Histoires
            <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">{stories.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === "reports"
                ? "bg-orange-500/30 border-orange-500/50 text-orange-300"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            } border`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Signalements
            {reports.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500/30 rounded-full text-xs text-orange-300">{reports.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-blue-500/30 border-blue-500/50 text-blue-300"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            } border`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Utilisateurs
            <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">{users.length}</span>
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            {error}
            <button onClick={() => setError("")} className="ml-4 underline">Fermer</button>
          </div>
        )}

        {/* Contenu selon l'onglet actif */}
        {activeTab === "stories" ? (
          <>
            {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-white/50 text-sm">Total histoires</p>
                <p className="text-2xl font-bold text-white">{stories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white/50 text-sm">Publiées</p>
                <p className="text-2xl font-bold text-white">
                  {stories.filter(s => s.status === "published" && !s.censorship?.censored).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-white/50 text-sm">Censurées</p>
                <p className="text-2xl font-bold text-white">
                  {stories.filter(s => s.censorship?.censored).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500/50"
            />
          </div>

          {/* Filtres par statut */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "Toutes", color: "white" },
              { key: "published", label: "Publiées", color: "green" },
              { key: "censored", label: "Censurées", color: "red" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key as "all" | "published" | "censored")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === key
                    ? color === "red"
                      ? "bg-red-500/30 border-red-500/50 text-red-300"
                      : color === "green"
                      ? "bg-green-500/30 border-green-500/50 text-green-300"
                      : "bg-white/20 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                } border`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des histoires */}
        <div className="space-y-4">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/40">Aucune histoire trouvée</p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <div
                key={story._id}
                className={`bg-white/5 border rounded-2xl p-6 transition-all hover:bg-white/10 ${
                  story.censorship?.censored
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Infos de l'histoire */}
                  <div className="flex items-start gap-4">
                    {/* Image de couverture */}
                    <div className="w-16 h-20 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                      {story.coverImage ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${story.coverImage}`}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">{story.title}</h3>
                        {story.censorship?.censored && (
                          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs">
                            Censurée
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          story.status === "published"
                            ? "bg-green-500/20 border border-green-500/30 text-green-400"
                            : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                        }`}>
                          {story.status === "published" ? "Publiée" : "Brouillon"}
                        </span>
                      </div>
                      
                      <p className="text-white/50 text-sm mb-2">
                        Par <span className="text-white/70">{getAuthorDisplayName(story.author)}</span>
                        {story.createdAt && (
                          <span className="ml-2">
                            • {new Date(story.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </p>

                      {story.censorship?.censored && story.censorship.reason && (
                        <p className="text-red-400/70 text-sm">
                          <span className="font-medium">Raison :</span> {story.censorship.reason}
                        </p>
                      )}

                      {story.description && (
                        <p className="text-white/40 text-sm line-clamp-1">{story.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    {story.censorship?.censored ? (
                      <button
                        onClick={() => handleUncensor(story)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lever la censure
                      </button>
                    ) : (
                      <button
                        onClick={() => openCensorModal(story)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Censurer
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/read/${story._id}`)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir
                    </button>

                    <button
                      onClick={() => openDeleteModal(story)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      title="Supprimer cette histoire"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        ) : activeTab === "reports" ? (
          /* Section des signalements */
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white/40">Aucun signalement en attente</p>
                <p className="text-white/30 text-sm mt-1">Les histoires signalées apparaîtront ici</p>
              </div>
            ) : (
              reports.map((report) => {
                const storyId = getReportStoryId(report);
                const story = stories.find(s => s._id === storyId);
                const isCensored = story?.censorship?.censored;
                
                return (
                  <div
                    key={report._id}
                    className="bg-white/5 border border-orange-500/30 rounded-2xl p-6 transition-all hover:bg-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Infos du signalement */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <h3 className="text-lg font-semibold text-white">
                            {getReportStoryTitle(report)}
                          </h3>
                          {isCensored && (
                            <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs">
                              Déjà censurée
                            </span>
                          )}
                        </div>
                        
                        <p className="text-white/50 text-sm mb-2">
                          Signalé par <span className="text-white/70">{getReportUserName(report)}</span>
                          {report.createdAt && (
                            <span className="ml-2">
                              • {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </p>

                        {/* Raison du signalement */}
                        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <p className="text-sm text-white/60">
                            <span className="text-orange-400 font-medium">Raison :</span>{" "}
                            <span className="text-white/80">{report.reason}</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                        {/* Voir l'histoire */}
                        <button
                          onClick={() => router.push(`/read/${storyId}`)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Voir
                        </button>

                        {/* Censurer l'histoire (si pas déjà censurée) */}
                        {!isCensored && (
                          <button
                            onClick={() => handleCensorFromReport(report)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Censurer
                          </button>
                        )}

                        {/* Ignorer le signalement */}
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                          title="Marquer comme traité"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ignorer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === "users" ? (
          /* Section des utilisateurs */
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-white/40">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              users.map((userItem) => (
                <div
                  key={userItem._id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Infos de l'utilisateur */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {userItem.profilePicture ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${userItem.profilePicture}`}
                            alt={userItem.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {userItem.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white truncate">{userItem.username}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            userItem.role === "admin"
                              ? "bg-red-500/20 border border-red-500/30 text-red-400"
                              : userItem.role === "creator"
                              ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                              : "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                          }`}>
                            {userItem.role === "admin" ? "Admin" : userItem.role === "creator" ? "Créateur" : "Utilisateur"}
                          </span>
                        </div>

                        <p className="text-white/50 text-sm mb-1">
                          {userItem.email}
                        </p>

                        {userItem.createdAt && (
                          <p className="text-white/40 text-xs">
                            Inscrit le {new Date(userItem.createdAt).toLocaleDateString("fr-FR", {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => router.push(`/profile?userId=${userItem._id}`)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir profil
                      </button>

                      {/* Ne pas permettre de se supprimer soi-même */}
                      {userItem._id !== user?._id && (
                        <button
                          onClick={() => openDeleteUserModal(userItem)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                          title="Supprimer cet utilisateur"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </main>

      {/* Modal de censure */}
      {showCensorModal && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCensorModal(false)} />
          
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            {/* Icône */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Censurer cette histoire ?
            </h2>
            <p className="text-white/60 text-center mb-6">
              <span className="text-white font-medium">&ldquo;{selectedStory.title}&rdquo;</span>
              <br />
              par {getAuthorDisplayName(selectedStory.author)}
            </p>

            {/* Raison */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">Raison de la censure</label>
              <textarea
                value={censorReason}
                onChange={(e) => setCensorReason(e.target.value)}
                placeholder="Contenu inapproprié, violation des règles..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 resize-none"
                rows={3}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCensorModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCensor}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 border border-red-500/50 text-white font-medium rounded-xl transition-all"
              >
                {isProcessing ? "Censure..." : "Censurer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && storyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />

          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            {/* Icône */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Supprimer définitivement ?
            </h2>
            <p className="text-white/60 text-center mb-2">
              <span className="text-white font-medium">&ldquo;{storyToDelete.title}&rdquo;</span>
              <br />
              par {getAuthorDisplayName(storyToDelete.author)}
            </p>

            {/* Avertissement */}
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400/90 text-sm text-center">
                ⚠️ Cette action est irréversible. L&apos;histoire, toutes ses pages, choix et progressions des joueurs seront définitivement supprimés.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 border border-red-500/50 text-white font-medium rounded-xl transition-all"
              >
                {isProcessing ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression d'utilisateur */}
      {showDeleteUserModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteUserModal(false)} />

          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            {/* Icône */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Supprimer cet utilisateur ?
            </h2>
            <p className="text-white/60 text-center mb-2">
              <span className="text-white font-medium">{userToDelete.username}</span>
              <br />
              <span className="text-sm">{userToDelete.email}</span>
            </p>

            {/* Avertissement */}
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400/90 text-sm text-center">
                ⚠️ Cette action est irréversible. L&apos;utilisateur, toutes ses histoires, ses progressions, ses commentaires et ses données seront définitivement supprimés.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 border border-red-500/50 text-white font-medium rounded-xl transition-all"
              >
                {isProcessing ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
