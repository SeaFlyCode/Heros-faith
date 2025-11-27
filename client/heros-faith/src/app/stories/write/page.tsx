"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";
import StoryTreeVisualization from "@/components/StoryTreeVisualization";
import {
  storyPagesApi,
  storyChoicesApi,
  storiesApi,
  type StoryPage,
  type StoryChoice,
  type ApiError
} from "@/api";

interface PageWithChoices extends StoryPage {
  choices: StoryChoice[];
}

export default function WriteStoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId");

  const [pages, setPages] = useState<PageWithChoices[]>([]);
  const [currentPage, setCurrentPage] = useState<PageWithChoices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyStatus, setStoryStatus] = useState<'draft' | 'published'>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fonction pour trier les pages dans l'ordre de l'arbre (racine en premier)
  const sortPagesTree = (pages: PageWithChoices[]): PageWithChoices[] => {
    if (pages.length === 0) return pages;

    // Trouver la page racine (celle qui n'est la cible d'aucun choix)
    const targetPageIds = new Set<string>();

    pages.forEach(page => {
      page.choices.forEach(choice => {
        if (choice.target_page_id) {
          targetPageIds.add(choice.target_page_id);
        }
      });
    });

    // La page racine est celle qui n'est jamais une cible
    const rootPage = pages.find(p => !targetPageIds.has(p._id));

    if (!rootPage) {
      console.warn("⚠️ Aucune page racine trouvée, utilisation de la première page");
      return pages;
    }

    // Trier en parcourant l'arbre en largeur
    const sorted: PageWithChoices[] = [];
    const queue: PageWithChoices[] = [rootPage];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current._id)) continue;
      visited.add(current._id);
      sorted.push(current);

      // Ajouter les enfants (pages ciblées par les choix de cette page)
      current.choices.forEach(choice => {
        if (choice.target_page_id) {
          const childPage = pages.find(p => p._id === choice.target_page_id);
          if (childPage && !visited.has(childPage._id)) {
            queue.push(childPage);
          }
        }
      });
    }

    // Ajouter les pages non visitées (orphelines) à la fin
    pages.forEach(page => {
      if (!visited.has(page._id)) {
        sorted.push(page);
      }
    });

    console.log(`✅ Pages triées: ${sorted.length} pages, racine = "${sorted[0]?._id}"`);
    return sorted;
  };

  const loadStoryAndPages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("📚 Chargement de l'histoire:", storyId);

      // Charger les infos de l'histoire
      const story = await storiesApi.getById(storyId!);
      setStoryTitle(story.title);
      setStoryStatus(story.status);

      // Charger toutes les pages de cette histoire
      const allPages = await storyPagesApi.getByStoryId(storyId!);
      console.log("✅ Pages récupérées:", allPages);

      // Si aucune page n'existe, créer la première
      if (allPages.length === 0) {
        console.log("📝 Création de la première page...");
        const firstPage = await storyPagesApi.create({
          story_id: storyId!,
          content: "",
          is_ending: false,
        });

        const pageWithChoices: PageWithChoices = {
          ...firstPage,
          choices: []
        };

        setPages([pageWithChoices]);
        setCurrentPage(pageWithChoices);
      } else {
        // Charger les choix pour chaque page
        const pagesWithChoices = await Promise.all(
          allPages.map(async (page) => {
            const choices = await storyChoicesApi.getByPageId(page._id);
            return { ...page, choices };
          })
        );

        // Trier les pages pour que la page racine (sans parent) soit en premier
        const sortedPages = sortPagesTree(pagesWithChoices);
        console.log(`📋 Ordre des pages après tri:`, sortedPages.map((p, i) => `${i}: ${p._id.substring(0, 8)}...`));
        console.log(`🏁 Première page (racine):`, sortedPages[0]?._id);

        setPages(sortedPages);
        setCurrentPage(sortedPages[0]);
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors du chargement:", apiError);
      setError(apiError.message || "Erreur lors du chargement de l'histoire");
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  // Charger l'histoire et ses pages au montage
  useEffect(() => {
    if (!storyId) {
      setError("ID de l'histoire manquant");
      setIsLoading(false);
      return;
    }

    loadStoryAndPages();
  }, [storyId, loadStoryAndPages]);

  const handleContentChange = async (value: string) => {
    if (!currentPage) return;

    setCurrentPage({ ...currentPage, content: value });
  };

  const handleContentBlur = async () => {
    if (!currentPage) return;

    try {
      setIsSaving(true);
      await storyPagesApi.update(currentPage._id, {
        content: currentPage.content,
      });
      console.log("✅ Page sauvegardée");

      // Mettre à jour la liste des pages
      setPages(pages.map(p => p._id === currentPage._id ? currentPage : p));
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors de la sauvegarde:", apiError);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChoice = () => {
    if (!currentPage || currentPage.is_ending) return;

    // Ajouter un choix temporaire (non sauvegardé)
    const tempChoice: StoryChoice = {
      _id: `temp-${Date.now()}`,
      page_id: currentPage._id,
      text: "",
      target_page_id: "",
    };

    setCurrentPage({
      ...currentPage,
      choices: [...currentPage.choices, tempChoice]
    });
  };

  const handleChoiceChange = (choiceId: string, value: string) => {
    if (!currentPage) return;

    setCurrentPage({
      ...currentPage,
      choices: currentPage.choices.map(c =>
        c._id === choiceId ? { ...c, text: value } : c
      )
    });
  };

  const handleChoiceBlur = async (choiceId: string) => {
    if (!currentPage) return;

    const choice = currentPage.choices.find(c => c._id === choiceId);
    if (!choice || choice._id.startsWith('temp-')) {
      // Ne pas sauvegarder les choix temporaires
      return;
    }

    try {
      setIsSaving(true);
      await storyChoicesApi.update(choice._id, {
        text: choice.text,
      });
      console.log("✅ Choix sauvegardé:", choice._id);

      // Mettre à jour la liste des pages
      setPages(pages.map(p => p._id === currentPage._id ? currentPage : p));
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors de la sauvegarde du choix:", apiError);
      setError("Erreur lors de la sauvegarde du choix");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChoice = async (choiceId: string) => {
    if (!currentPage) return;

    const choice = currentPage.choices.find(c => c._id === choiceId);
    if (!choice || !choice.text.trim()) {
      setError("Le texte du choix ne peut pas être vide");
      return;
    }

    // Si le choix est déjà sauvegardé, ne rien faire
    if (!choice._id.startsWith('temp-')) {
      return;
    }

    try {
      setIsSaving(true);

      // Créer le choix sans page cible (sera ajoutée plus tard lors du développement)
      const savedChoice = await storyChoicesApi.create({
        page_id: currentPage._id,
        text: choice.text,
        target_page_id: "", // Pas de page cible pour l'instant
      });

      console.log("✅ Choix sauvegardé (sans développement):", savedChoice);

      // Mettre à jour le choix dans l'état local
      const updatedPage = {
        ...currentPage,
        choices: currentPage.choices.map(c =>
          c._id === choiceId ? savedChoice : c
        )
      };

      setCurrentPage(updatedPage);
      setPages(pages.map(p => p._id === currentPage._id ? updatedPage : p));
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors de la sauvegarde du choix:", apiError);
      setError(apiError.message || "Erreur lors de la sauvegarde du choix");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDevelopChoice = async (choiceId: string) => {
    if (!currentPage || !storyId) return;

    const choice = currentPage.choices.find(c => c._id === choiceId);
    if (!choice || !choice.text.trim()) {
      setError("Le texte du choix ne peut pas être vide");
      return;
    }

    try {
      setIsSaving(true);

      // 1. Créer une nouvelle page cible
      const newPage = await storyPagesApi.create({
        story_id: storyId,
        content: "",
        is_ending: false,
      });

      console.log("✅ Nouvelle page créée:", newPage);

      // 2. Créer ou mettre à jour le choix avec la page cible
      let savedChoice: StoryChoice;
      if (choice._id.startsWith('temp-')) {
        // Créer le choix
        savedChoice = await storyChoicesApi.create({
          page_id: currentPage._id,
          text: choice.text,
          target_page_id: newPage._id,
        });
      } else {
        // Mettre à jour le choix existant
        savedChoice = await storyChoicesApi.update(choice._id, {
          text: choice.text,
          target_page_id: newPage._id,
        });
      }

      console.log("✅ Choix sauvegardé:", savedChoice);

      // 3. Mettre à jour la page actuelle avec le choix sauvegardé
      const updatedCurrentPage = {
        ...currentPage,
        choices: currentPage.choices.map(c =>
          c._id === choiceId ? savedChoice : c
        )
      };

      // 4. Ajouter la nouvelle page à la liste et mettre à jour la page actuelle
      const newPageWithChoices: PageWithChoices = {
        ...newPage,
        choices: []
      };

      setPages([...pages.map(p => p._id === currentPage._id ? updatedCurrentPage : p), newPageWithChoices]);
      setCurrentPage(updatedCurrentPage);

      // 5. Naviguer vers la nouvelle page
      setCurrentPage(newPageWithChoices);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors du développement:", apiError);
      setError(apiError.message || "Erreur lors du développement du choix");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetAsEnd = async () => {
    if (!currentPage) return;

    try {
      setIsSaving(true);
      await storyPagesApi.update(currentPage._id, {
        is_ending: true,
        ending_label: "Fin"
      });

      const updatedPage = { ...currentPage, is_ending: true, ending_label: "Fin", choices: [] };
      setCurrentPage(updatedPage);
      setPages(pages.map(p => p._id === currentPage._id ? updatedPage : p));

      console.log("✅ Page marquée comme fin");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur:", apiError);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsetAsEnd = async () => {
    if (!currentPage) return;

    try {
      setIsSaving(true);
      await storyPagesApi.update(currentPage._id, {
        is_ending: false,
        ending_label: undefined
      });

      const updatedPage = { ...currentPage, is_ending: false, ending_label: undefined };
      setCurrentPage(updatedPage);
      setPages(pages.map(p => p._id === currentPage._id ? updatedPage : p));

      console.log("✅ Page n'est plus une fin");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur:", apiError);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Convertir les pages en nœuds pour la visualisation d'arbre
  const convertPagesToNodes = () => {
    const nodes = pages.map((page, index) => {
      // Trouver le parent de cette page (la page qui a un choix pointant vers celle-ci)
      let parentId: string | undefined;
      let parentChoiceId: string | undefined;
      let label: string | undefined;

      for (const p of pages) {
        const choice = p.choices.find((c) => c.target_page_id === page._id);
        if (choice) {
          parentId = p._id;
          parentChoiceId = choice._id;
          label = choice.text || "Choix sans nom";
          break;
        }
      }

      // Si la page n'a pas de parent, c'est la page racine = "Début"
      if (!parentId) {
        label = "Début";
        console.log(`🏁 Page racine trouvée: ${page._id} (index ${index})`);
      }

      return {
        id: page._id,
        label: label,
        context: page.content || "Page vide",
        choices: page.choices.map((c) => ({
          id: c._id,
          text: c.text,
          nextNodeId: c.target_page_id || undefined,
        })),
        isEnd: page.is_ending || false,
        parentId,
        parentChoiceId,
      };
    });

    console.log(`🌳 Nœuds générés pour l'arborescence:`, nodes.map(n => ({ id: n.id, label: n.label, parentId: n.parentId })));
    return nodes;
  };

  const handleNodeSelect = (node: { id: string; label?: string; context: string; choices: any[]; isEnd: boolean; parentId?: string; parentChoiceId?: string }) => {
    const page = pages.find((p) => p._id === node.id);
    if (page) {
      setCurrentPage(page);
      console.log(`✅ Navigation vers le nœud: ${node.label || "Sans nom"} (${node.id})`);
    } else {
      console.error(`❌ Page non trouvée pour le nœud: ${node.id}`);
    }
  };

  const handlePublishStory = async () => {
    if (!storyId) return;

    // Vérifier qu'il y a au moins une page
    if (pages.length === 0) {
      setError("Vous devez créer au moins une page avant de publier l'histoire");
      return;
    }

    // Vérifier qu'il y a au moins une fin
    const hasEnding = pages.some(p => p.is_ending);
    if (!hasEnding) {
      setError("Vous devez marquer au moins une page comme fin avant de publier");
      return;
    }

    try {
      setIsPublishing(true);
      setError("");

      await storiesApi.update(storyId, { status: 'published' });
      setStoryStatus('published');

      console.log("✅ Histoire publiée avec succès !");
      alert("🎉 Votre histoire a été publiée avec succès ! Elle est maintenant visible dans la section 'Lire les histoires'.");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors de la publication:", apiError);
      setError(apiError.message || "Erreur lors de la publication de l'histoire");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishStory = async () => {
    if (!storyId) return;

    try {
      setIsPublishing(true);
      setError("");

      await storiesApi.update(storyId, { status: 'draft' });
      setStoryStatus('draft');

      console.log("Histoire remise en brouillon");
      alert("Votre histoire a été remise en brouillon.");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur:", apiError);
      setError(apiError.message || "Erreur lors de la modification du statut");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!storyId) return;

    try {
      setIsDeleting(true);
      setError("");

      // Supprimer l'histoire (le backend supprime automatiquement les pages, choix et liens associés)
      await storiesApi.delete(storyId);

      console.log("✅ Histoire supprimée avec succès");

      // Rediriger vers la liste des histoires
      router.push("/stories");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("❌ Erreur lors de la suppression:", apiError);
      setError(apiError.message || "Erreur lors de la suppression de l'histoire");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (error && !storyId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background animé Prism avec transition */}
      <div className="fixed inset-0 z-0 pointer-events-none">
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

      {/* Bouton retour */}
      <button
        type="button"
        onClick={() => router.push("/stories")}
        className="fixed top-24 left-6 z-[60] group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-lg text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all duration-300 border border-white/10 hover:border-white/20"
        aria-label="Retour à mes histoires"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm hidden sm:inline">Retour</span>
      </button>

      {/* Arborescence en haut à droite */}
      {currentPage && pages.length > 0 && (
        <div className="fixed top-24 right-6 z-[60]">
          <StoryTreeVisualization
            nodes={convertPagesToNodes()}
            currentNode={convertPagesToNodes().find((n) => n.id === currentPage._id)}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      )}

      {/* Contenu principal */}
      <main className="relative z-10 min-h-screen pt-32 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2 font-montserrat tracking-tight">
            {storyTitle}
          </h1>

          {/* Nom du nœud actuel */}
          {currentPage && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-cyan-400 font-medium text-lg">
                {convertPagesToNodes().find((n) => n.id === currentPage._id)?.label || "Début"}
              </span>
            </div>
          )}

          {/* Badge de statut et boutons d'actions */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {storyStatus === 'draft' ? (
              <>
                <span className="px-3 py-1.5 bg-orange-500/20 border border-orange-400/50 text-orange-300 text-sm rounded-full font-semibold flex items-center gap-2">
                  Brouillon
                </span>
                <button
                  onClick={handlePublishStory}
                  disabled={isPublishing || pages.length === 0}
                  className="px-4 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-300 text-sm rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publication...
                    </>
                  ) : (
                    <>
                      Publier l'histoire
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <span className="px-3 py-1.5 bg-green-500/20 border border-green-400/50 text-green-300 text-sm rounded-full font-semibold flex items-center gap-2">
                  ✅ Publiée
                </span>
                <button
                  onClick={handleUnpublishStory}
                  disabled={isPublishing}
                  className="px-4 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 text-orange-300 text-sm rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? "Modification..." : "Repasser en brouillon"}
                </button>
              </>
            )}

            {/* Bouton de suppression */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 text-sm rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              title="Supprimer l'histoire"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>

          <p className="text-white/60 text-center mb-8">
            {isSaving ? "Sauvegarde en cours..." : "Créez votre histoire interactive"}
          </p>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-red-200 text-sm font-medium">{error}</span>
                <button
                  onClick={() => setError("")}
                  className="ml-2 text-red-300 hover:text-red-100 text-xs underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {currentPage && (
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden mb-6">
              <div className="p-6">
                {/* Contenu de la page */}
                <div className="mb-6">
                  <label htmlFor="content" className="text-white font-semibold text-lg mb-3 block">
                    Contenu de la page
                  </label>
                  <textarea
                    id="content"
                    value={currentPage.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onBlur={handleContentBlur}
                    placeholder="Écrivez le contenu narratif de cette partie de l'histoire..."
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:bg-white/10 resize-none"
                  />
                </div>

                {/* Choix */}
                {!currentPage.is_ending && (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">Choix possibles</h3>
                        <button
                          type="button"
                          onClick={handleAddChoice}
                          className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-sm rounded-xl border border-cyan-400/30 transition-all"
                        >
                          + Ajouter un choix
                        </button>
                      </div>

                      {currentPage.choices.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-4">
                          Aucun choix ajouté. Cliquez sur &quot;Ajouter un choix&quot; pour en créer un.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentPage.choices.map((choice, index) => (
                            <div
                              key={choice._id}
                              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4"
                            >
                              <h4 className="text-white font-semibold mb-3">
                                Choix {index + 1}
                                {choice._id.startsWith('temp-') && (
                                  <span className="ml-2 text-xs text-orange-400">(non sauvegardé)</span>
                                )}
                              </h4>
                              <input
                                type="text"
                                value={choice.text}
                                onChange={(e) => handleChoiceChange(choice._id, e.target.value)}
                                onBlur={() => handleChoiceBlur(choice._id)}
                                placeholder={`Texte du choix ${index + 1}...`}
                                className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all mb-3"
                              />
                              {choice.target_page_id ? (
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Choix développé
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDevelopChoice(choice._id)}
                                  disabled={!choice.text.trim() || isSaving}
                                  className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-sm rounded-xl border border-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  Développer →
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-4 mt-6">
                  {!currentPage.is_ending && (
                    <button
                      type="button"
                      onClick={handleSetAsEnd}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold rounded-2xl border border-green-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Marquer comme fin
                    </button>
                  )}
                  {currentPage.is_ending && (
                    <button
                      type="button"
                      onClick={handleUnsetAsEnd}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-orange-500/30 text-green-300 hover:text-orange-300 font-semibold rounded-2xl border border-green-400/30 hover:border-orange-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>C&apos;est une fin - Cliquez pour continuer l&apos;histoire</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-red-500/50 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-white text-2xl font-bold">Supprimer l&apos;histoire</h2>
            </div>

            <p className="text-white/70 mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement <span className="font-semibold text-white">&quot;{storyTitle}&quot;</span> ?
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
              <p className="text-red-300 text-sm">
                ⚠️ Cette action est <span className="font-bold">irréversible</span>. Tous les nœuds, choix et liens associés seront également supprimés.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteStory}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 text-red-200 font-semibold rounded-2xl border border-red-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Oui, supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
