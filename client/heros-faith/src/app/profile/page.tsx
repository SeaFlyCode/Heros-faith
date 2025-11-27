"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Prism from "@/components/Prism";
import Link from "next/link";
import { usersApi, storiesApi, partiesApi, UserStats, Story, Party, PartyStory } from "@/api";
import { getProfileImageUrl } from "@/utils/imageUrl";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [myParties, setMyParties] = useState<Party[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [partiesLoading, setPartiesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Log pour tracer la photo de profil
  useEffect(() => {
    if (user?.profilePicture) {
      const imageUrl = getProfileImageUrl(user.profilePicture);
      console.log('📸 [ProfilePage] Chargement de la photo de profil:', {
        profilePicture: user.profilePicture,
        imageUrl,
        username: user.username,
        timestamp: new Date().toISOString()
      });
    } else if (user) {
      console.log('📸 [ProfilePage] Aucune photo de profil définie pour l\'utilisateur:', user.username);
    }
  }, [user?.profilePicture, user?.username]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        // Récupérer les statistiques
        try {
          const userStats = await usersApi.getStats(user._id);
          setStats(userStats);
        } catch (error) {
          console.error("Erreur lors de la récupération des statistiques:", error);
        } finally {
          setStatsLoading(false);
        }

        // Récupérer les histoires écrites
        try {
          const stories = await storiesApi.getMyStories();
          setMyStories(stories);
        } catch (error) {
          console.error("Erreur lors de la récupération des histoires:", error);
        } finally {
          setStoriesLoading(false);
        }

        // Récupérer les parties (histoires lues)
        try {
          const parties = await partiesApi.getByUserId(user._id);
          setMyParties(parties);
        } catch (error) {
          console.error("Erreur lors de la récupération des parties:", error);
        } finally {
          setPartiesLoading(false);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Formater la date d'inscription
  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "Aujourd'hui";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Formater une date courte
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper pour récupérer les infos de l'histoire d'une partie
  const getPartyStoryInfo = (party: Party): { title: string; id: string } => {
    if (typeof party.story_id === 'object' && party.story_id !== null) {
      return { title: (party.story_id as PartyStory).title, id: (party.story_id as PartyStory)._id };
    }
    return { title: 'Histoire inconnue', id: party.story_id as string };
  };

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
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* En-tête : Mon Espace */}
          <h1 className="text-5xl font-bold text-white mb-8 text-center">Mon Espace</h1>

          {/* Section principale avec 3 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Colonne 1 : Photo de profil */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 flex flex-col items-center">
                {/* Photo de profil */}
                <div className="relative group mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-4 border-white/20 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img
                        src={getProfileImageUrl(user.profilePicture) || ''}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-4xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Overlay pour modifier */}
                  <Link 
                    href="/profile/edit"
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </div>

                {/* Nom d'utilisateur */}
                <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
                <p className="text-white/60 text-sm mb-4">{user.email}</p>

                {/* Bouton modifier profil */}
                <Link
                  href="/profile/edit"
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg text-center no-underline block"
                >
                  Modifier profil
                </Link>
              </div>
            </div>

            {/* Colonne 2 : Historique des histoires écrites */}
            <div className="lg:col-span-4">
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Histoires écrites</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {storiesLoading ? (
                    <div className="text-center py-8">
                      <div className="text-white/60">Chargement...</div>
                    </div>
                  ) : myStories.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-white/60">Aucune histoire écrite</p>
                      <Link
                        href="/stories/new"
                        className="inline-block mt-4 px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors no-underline"
                      >
                        Créer une histoire
                      </Link>
                    </div>
                  ) : (
                    myStories.map((story) => (
                      <Link
                        key={story._id}
                        href={`/stories/write?id=${story._id}`}
                        className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all no-underline group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
                              {story.title}
                            </h4>
                            <p className="text-white/50 text-sm mt-1 line-clamp-2">
                              {story.description || "Pas de description"}
                            </p>
                          </div>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            story.status === 'published' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {story.status === 'published' ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs mt-2">
                          {formatDate(story.createdAt)}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 3 : Historique des histoires lues */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Histoires lues</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {partiesLoading ? (
                    <div className="text-center py-8">
                      <div className="text-white/60">Chargement...</div>
                    </div>
                  ) : myParties.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p className="text-white/60">Aucune histoire lue</p>
                      <Link
                        href="/read"
                        className="inline-block mt-4 px-6 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-xl transition-colors no-underline"
                      >
                        Découvrir des histoires
                      </Link>
                    </div>
                  ) : (
                    myParties.map((party) => {
                      const storyInfo = getPartyStoryInfo(party);
                      return (
                        <Link
                          key={party._id}
                          href={`/read/${storyInfo.id}`}
                          className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all no-underline group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate group-hover:text-pink-300 transition-colors">
                                {storyInfo.title}
                              </h4>
                              <p className="text-white/50 text-sm mt-1">
                                Commencé le {formatDate(party.start_date)}
                              </p>
                            </div>
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              party.end_date 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {party.end_date ? 'Terminé' : 'En cours'}
                            </span>
                          </div>
                          {party.end_date && (
                            <p className="text-white/40 text-xs mt-2">
                              Terminé le {formatDate(party.end_date)}
                            </p>
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section Statistiques */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Statistiques</h2>

            {statsLoading ? (
              <div className="text-center py-8">
                <div className="text-white/60">Chargement des statistiques...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stat 1 : Histoires écrites */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <span className="text-4xl font-bold text-white">{stats?.storiesWritten || 0}</span>
                    </div>
                    <p className="text-purple-200 text-sm">Histoires écrites</p>
                  </div>

                  {/* Stat 2 : Parties terminées */}
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-2xl p-6 border border-pink-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-4xl font-bold text-white">{stats?.completedParties || 0}</span>
                    </div>
                    <p className="text-pink-200 text-sm">Parties terminées</p>
                  </div>

                  {/* Stat 3 : Pages écrites */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-4xl font-bold text-white">{stats?.pagesWritten || 0}</span>
                    </div>
                    <p className="text-blue-200 text-sm">Pages écrites</p>
                  </div>

                  {/* Stat 4 : Notes données */}
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-4xl font-bold text-white">{stats?.ratingsGiven || 0}</span>
                    </div>
                    <p className="text-green-200 text-sm">Notes données</p>
                  </div>
                </div>

                {/* Info supplémentaires */}
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-1">Membre depuis</p>
                    <p className="text-white font-semibold">{formatMemberSince(stats?.memberSince || user.createdAt)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-1">Note moyenne reçue</p>
                    <div className="flex items-center justify-center gap-1">
                      {stats?.averageRating && stats.averageRating > 0 ? (
                        <>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`w-5 h-5 ${star <= Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-600'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-white ml-2">({stats.averageRating}/5)</span>
                        </>
                      ) : (
                        <span className="text-white/60">Non noté</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-1">Rôle</p>
                    <p className="text-white font-semibold capitalize">{user.role}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
