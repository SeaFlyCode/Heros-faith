"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface StoryNode {
  id: string;
  label?: string; // Le nom du nœud (basé sur le choix parent)
  context: string;
  choices: Choice[];
  isEnd: boolean;
  parentId?: string;
  parentChoiceId?: string;
}

interface Choice {
  id: string;
  text: string;
  nextNodeId?: string;
}

interface StoryTreeVisualizationProps {
  nodes: StoryNode[];
  currentNode?: StoryNode;
  onNodeSelect: (node: StoryNode) => void;
}

export default function StoryTreeVisualization({
  nodes,
  currentNode,
  onNodeSelect,
}: StoryTreeVisualizationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [zoom, setZoom] = useState(1); // Niveau de zoom (0.5 à 2)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const miniContainerRef = useRef<HTMLDivElement>(null);


  // Log des props reçues
  useEffect(() => {
    console.log("🎨 [StoryTreeVisualization] Rendu avec:", {
      nodesCount: nodes.length,
      currentNodeId: currentNode?.id?.substring(0, 8),
      currentNodeLabel: currentNode?.label,
      nodes: nodes.map(n => ({
        id: n.id.substring(0, 8),
        label: n.label,
        parentId: n.parentId?.substring(0, 8),
        choicesCount: n.choices.length,
        isEnd: n.isEnd
      }))
    });
  }, [nodes, currentNode]);

  // Fonctions de zoom
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const resetZoom = () => setZoom(1);

  // Gestion du drag pour naviguer
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = miniContainerRef.current;
    if (!container) return;
    
    // Ne pas démarrer le drag si on clique sur un nœud
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop
    });
    container.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = miniContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    container.scrollLeft = dragStart.scrollLeft - deltaX;
    container.scrollTop = dragStart.scrollTop - deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = miniContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = miniContainerRef.current;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  };

  // Vérifier que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Gérer la molette pour zoomer
  useEffect(() => {
    const container = miniContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Gérer le défilement du body et la touche Échap quand le modal est ouvert
  useEffect(() => {
    if (isModalOpen) {
      // Empêcher le défilement du body
      document.body.style.overflow = 'hidden';

      // Gérer la touche Échap pour fermer le modal
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen]);

  // Fonction pour centrer un nœud avec animation
  const centerNode = (nodeId: string) => {
    const nodeElement = nodeRefs.current.get(nodeId);
    if (nodeElement && containerRef.current) {
      const container = containerRef.current;
      const nodeRect = nodeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculer la position pour centrer le nœud
      const scrollLeft = container.scrollLeft + nodeRect.left - containerRect.left - containerRect.width / 2 + nodeRect.width / 2;
      const scrollTop = container.scrollTop + nodeRect.top - containerRect.top - containerRect.height / 2 + nodeRect.height / 2;

      // Animation smooth vers la position
      container.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Effet pour centrer le nœud sélectionné quand il change (modal)
  useEffect(() => {
    if (isModalOpen && currentNode && nodeRefs.current.has(currentNode.id)) {
      // Délai pour s'assurer que le rendu est complet
      setTimeout(() => {
        centerNode(currentNode.id);
      }, 150);
    }
  }, [currentNode, isModalOpen]);

  // Effet pour scroller vers le nœud actuel dans la vue minimaliste
  useEffect(() => {
    if (!isModalOpen && currentNode && miniContainerRef.current) {
      const container = miniContainerRef.current;
      const nodeElement = container.querySelector(`[data-node-id="${currentNode.id}"]`) as HTMLElement;

      if (nodeElement) {
        // Scroller pour centrer le nœud actuel
        setTimeout(() => {
          nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 100);
      }
    }
  }, [currentNode, isModalOpen]);

  const setNodeRef = (nodeId: string, element: HTMLDivElement | null) => {
    if (element) {
      nodeRefs.current.set(nodeId, element);
    } else {
      nodeRefs.current.delete(nodeId);
    }
  };

  // Mémorisation des niveaux pour éviter les recalculs
  const levelCache = useRef<Map<string, number>>(new Map());

  // Algorithme de positionnement pour éviter les superpositions
  const calculatePositions = (maxNodes?: number) => {
    const nodesToProcess = maxNodes ? nodes.slice(0, maxNodes) : nodes;
    const positions = new Map<string, { x: number; y: number }>();

    console.log(`📐 [calculatePositions] Calcul des positions pour ${nodesToProcess.length} nœuds (max: ${maxNodes || 'tous'})`);

    // Nettoyer le cache si les nœuds ont changé
    if (levelCache.current.size > nodes.length) {
      levelCache.current.clear();
    }

    // Calculer la profondeur de chaque nœud depuis la racine
    const getDepth = (nodeId: string, visited = new Set<string>()): number => {
      if (levelCache.current.has(nodeId)) {
        return levelCache.current.get(nodeId)!;
      }

      // Détecter les cycles
      if (visited.has(nodeId)) {
        console.error(`🔴 Cycle détecté pour le nœud ${nodeId.substring(0, 8)}!`);
        return 0;
      }

      visited.add(nodeId);

      const n = nodes.find((nd) => nd.id === nodeId);
      if (!n || !n.parentId) {
        console.log(`🏁 Nœud racine ou sans parent: ${nodeId.substring(0, 8)}`);
        levelCache.current.set(nodeId, 0);
        return 0;
      }
      const depth = getDepth(n.parentId, visited) + 1;
      console.log(`📏 Nœud ${nodeId.substring(0, 8)} à profondeur ${depth} (parent: ${n.parentId.substring(0, 8)})`);
      levelCache.current.set(nodeId, depth);
      return depth;
    };

    // Calculer la profondeur maximale de l'arbre
    const maxDepth = Math.max(...nodesToProcess.map(n => getDepth(n.id)), 0);
    console.log(`🌳 Profondeur maximale de l'arbre: ${maxDepth}`);

    // Espacement vertical adaptatif basé sur la profondeur
    const getVerticalSpacing = () => {
      if (maxNodes) {
        // Vue minimaliste : espacement en % de la hauteur (25% par niveau)
        return Math.max(20, Math.min(30, 80 / (maxDepth + 1)));
      }
      // Vue complète : espacement compact (80-100px par niveau)
      return Math.max(80, Math.min(100, 400 / (maxDepth + 1)));
    };

    const verticalSpacing = getVerticalSpacing();
    console.log(`📊 Espacement vertical: ${verticalSpacing}${maxNodes ? '%' : 'px'}`);

    // Compter les nœuds à chaque niveau pour l'espacement horizontal
    const nodesPerLevel = new Map<number, StoryNode[]>();
    nodesToProcess.forEach(node => {
      const depth = getDepth(node.id);
      if (!nodesPerLevel.has(depth)) {
        nodesPerLevel.set(depth, []);
      }
      nodesPerLevel.get(depth)!.push(node);
    });

    console.log(`📊 Nœuds par niveau:`, Array.from(nodesPerLevel.entries()).map(([level, nodes]) =>
      `Niveau ${level}: ${nodes.length} nœud(s)`
    ));

    // Positionner les nœuds niveau par niveau
    const positionedNodes = new Set<string>();

    const positionNode = (nodeId: string, preferredX?: number): number => {
      if (positionedNodes.has(nodeId)) {
        return positions.get(nodeId)?.x || 50;
      }

      const node = nodesToProcess.find((n) => n.id === nodeId);
      if (!node) {
        console.warn(`⚠️ Nœud non trouvé: ${nodeId.substring(0, 8)}`);
        return 50;
      }

      const depth = getDepth(nodeId);
      const children = nodesToProcess.filter((n) => n.parentId === nodeId);

      console.log(`📍 Positionnement du nœud ${nodeId.substring(0, 8)} (profondeur ${depth}, ${children.length} enfant(s))`);

      let x: number;

      if (children.length > 0) {
        // Positionner d'abord les enfants
        const childXPositions: number[] = [];
        const levelNodes = nodesPerLevel.get(depth + 1) || [];
        const childrenInLevel = children.filter(c => levelNodes.includes(c));

        childrenInLevel.forEach((child, idx) => {
          // Espacement horizontal entre frères
          const spreadFactor = Math.max(15, Math.min(25, 80 / childrenInLevel.length));
          const baseX = preferredX !== undefined ? preferredX : 50;
          const offset = (idx - (childrenInLevel.length - 1) / 2) * spreadFactor;
          const childX = positionNode(child.id, Math.max(10, Math.min(90, baseX + offset)));
          childXPositions.push(childX);
        });

        // Positionner le parent au centre de ses enfants
        x = childXPositions.length > 0
          ? childXPositions.reduce((sum, x) => sum + x, 0) / childXPositions.length
          : (preferredX !== undefined ? preferredX : 50);
      } else {
        // Nœud feuille : utiliser la position préférée
        x = preferredX !== undefined ? preferredX : 50;
      }

      // Assurer que x reste dans les limites
      x = Math.max(10, Math.min(90, x));

      // Calculer y : pour la mini vue, on commence à 15% et on espace de verticalSpacing%
      const y = maxNodes
        ? 15 + depth * verticalSpacing  // Commence à 15% du haut
        : depth * verticalSpacing + 30; // Pixels pour vue complète

      positions.set(nodeId, { x, y });
      positionedNodes.add(nodeId);

      console.log(`✅ Nœud ${nodeId.substring(0, 8)} positionné à (${x.toFixed(1)}, ${y.toFixed(1)})`);

      return x;
    };

    // Trouver le nœud racine et commencer le positionnement
    const rootNode = nodesToProcess.find((n) => !n.parentId);
    if (rootNode) {
      console.log(`🎯 Démarrage du positionnement depuis la racine: ${rootNode.id.substring(0, 8)}`);
      positionNode(rootNode.id, 50);
    } else {
      console.error(`🔴 Aucun nœud racine trouvé!`);
    }

    console.log(`✅ ${positions.size} positions calculées`);

    return positions;
  };

  return (
    <>
      {/* Vue minimaliste - Compacte et scrollable */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-xl border border-cyan-400/30 shadow-xl p-2 w-full sm:w-56 max-w-xs sm:max-w-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="bg-cyan-500/20 p-1.5 rounded-md">
              <svg
                className="w-3 h-3 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-xs">Carte</h3>
              <p className="text-cyan-300 text-[10px]">{nodes.length} nœud{nodes.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Contrôles de zoom */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={zoom <= 0.4}
              className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 active:bg-white/30 text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm sm:text-xs font-bold cursor-pointer touch-manipulation"
              title="Dézoomer"
              type="button"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              className="px-2 h-6 sm:px-1.5 sm:h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 active:bg-white/30 text-cyan-300 transition-all text-[10px] sm:text-[9px] font-medium cursor-pointer touch-manipulation"
              title="Réinitialiser le zoom"
              type="button"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoom >= 2}
              className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 active:bg-white/30 text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm sm:text-xs font-bold cursor-pointer touch-manipulation"
              title="Zoomer"
              type="button"
            >
              +
            </button>
          </div>
          <span className="text-[9px] sm:text-[8px] text-white/40 hidden sm:inline">Glisser</span>
        </div>

        {/* Légende */}
        <div className="mb-1.5 px-1 py-1 bg-black/20 rounded border border-white/10">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3 h-0.5 bg-cyan-400"></div>
            <span className="text-[9px] text-cyan-300">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-orange-400"></div>
            <span className="text-[9px] text-orange-400">Retour</span>
          </div>
        </div>

        {/* Visualisation graphique scrollable avec drag */}
        <div 
          ref={miniContainerRef} 
          className={`relative h-40 bg-black/30 rounded-lg overflow-auto border border-cyan-400/20 shadow-inner select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(34, 211, 238, 0.3) rgba(0, 0, 0, 0.2)'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {nodes.length > 0 ? (
            <>
              {(() => {
                const nodesToShow = nodes;

                // Calculer la profondeur de chaque nœud avec détection de cycle
                const getNodeDepth = (nodeId: string, visited: Set<string> = new Set()): number => {
                  // Détection de cycle
                  if (visited.has(nodeId)) {
                    console.warn(`Cycle détecté pour le nœud ${nodeId}`);
                    return 0;
                  }

                  const node = nodesToShow.find(n => n.id === nodeId);
                  if (!node || !node.parentId) return 0;

                  // Marquer comme visité
                  const newVisited = new Set(visited);
                  newVisited.add(nodeId);

                  return getNodeDepth(node.parentId, newVisited) + 1;
                };

                // Trouver la profondeur max
                let maxDepth = 0;
                nodesToShow.forEach(node => {
                  maxDepth = Math.max(maxDepth, getNodeDepth(node.id));
                });

                // Paramètres de layout en PIXELS - ajustés par le zoom
                const baseStartY = 50;
                const baseLevelSpacing = 100; // Espace vertical entre les niveaux
                const baseNodeSpacing = 120; // Espacement horizontal minimum entre nœuds
                const startY = baseStartY * zoom;
                const levelSpacing = baseLevelSpacing * zoom;
                const nodeSpacing = baseNodeSpacing * zoom;

                // Calculer les positions avec un algorithme récursif qui respecte la hiérarchie
                const positions = new Map<string, { x: number; y: number }>();
                const subtreeWidths = new Map<string, number>(); // Largeur du sous-arbre de chaque nœud

                // Calculer la largeur du sous-arbre pour chaque nœud (nombre de feuilles) avec détection de cycle
                const getSubtreeWidth = (nodeId: string, visited: Set<string> = new Set()): number => {
                  if (subtreeWidths.has(nodeId)) return subtreeWidths.get(nodeId)!;
                  
                  // Détection de cycle
                  if (visited.has(nodeId)) {
                    console.warn(`Cycle détecté dans getSubtreeWidth pour le nœud ${nodeId}`);
                    subtreeWidths.set(nodeId, 1);
                    return 1;
                  }

                  const children = nodesToShow.filter(n => n.parentId === nodeId);
                  if (children.length === 0) {
                    subtreeWidths.set(nodeId, 1);
                    return 1;
                  }
                  
                  const newVisited = new Set(visited);
                  newVisited.add(nodeId);

                  const width = children.reduce((sum, child) => sum + getSubtreeWidth(child.id, newVisited), 0);
                  subtreeWidths.set(nodeId, width);
                  return width;
                };

                // Positionner récursivement depuis la racine avec détection de cycle
                const positioningNodes = new Set<string>();
                const positionSubtree = (nodeId: string, depth: number, leftX: number): number => {
                  const node = nodesToShow.find(n => n.id === nodeId);
                  if (!node) return leftX;

                  // Détection de cycle - si déjà en cours de positionnement, ignorer
                  if (positioningNodes.has(nodeId)) {
                    console.warn(`Cycle détecté lors du positionnement du nœud ${nodeId}`);
                    return leftX;
                  }

                  // Si déjà positionné, retourner
                  if (positions.has(nodeId)) {
                    return leftX + nodeSpacing;
                  }

                  positioningNodes.add(nodeId);

                  const children = nodesToShow.filter(n => n.parentId === nodeId);
                  const subtreeWidth = getSubtreeWidth(nodeId);
                  
                  // Y en pixels basé sur la profondeur
                  const y = startY + depth * levelSpacing;

                  if (children.length === 0) {
                    // Nœud feuille : positionner au centre de son espace
                    const x = leftX + nodeSpacing / 2;
                    positions.set(nodeId, { x, y });
                    positioningNodes.delete(nodeId);
                    return leftX + nodeSpacing;
                  }

                  // Positionner les enfants d'abord
                  let currentX = leftX;
                  children.forEach(child => {
                    currentX = positionSubtree(child.id, depth + 1, currentX);
                  });

                  // Positionner le parent au centre de ses enfants
                  const childPositions = children.map(c => positions.get(c.id)).filter(p => p !== undefined);
                  if (childPositions.length > 0) {
                    const minChildX = Math.min(...childPositions.map(p => p!.x));
                    const maxChildX = Math.max(...childPositions.map(p => p!.x));
                    const x = (minChildX + maxChildX) / 2;
                    positions.set(nodeId, { x, y });
                  } else {
                    // Pas d'enfants positionnés, positionner au centre de l'espace
                    const x = leftX + nodeSpacing / 2;
                    positions.set(nodeId, { x, y });
                  }

                  positioningNodes.delete(nodeId);
                  return currentX;
                };

                // Trouver la racine et positionner tout l'arbre
                const rootNode = nodesToShow.find(n => !n.parentId);
                let totalWidth = nodeSpacing;
                if (rootNode) {
                  totalWidth = positionSubtree(rootNode.id, 0, 0);
                }

                // Calculer les dimensions du conteneur
                const containerWidth = Math.max(350, totalWidth + 50 * zoom);
                const containerHeight = Math.max(260, startY + (maxDepth + 1) * levelSpacing + 40 * zoom);

                // Centrer l'arbre dans le conteneur
                const offsetX = (containerWidth - totalWidth) / 2;
                positions.forEach((pos, nodeId) => {
                  positions.set(nodeId, { x: pos.x + offsetX, y: pos.y });
                });

                // Grouper les nœuds par niveau (pour le rendu des lignes)
                const nodesByLevel = new Map<number, typeof nodesToShow>();
                nodesToShow.forEach(node => {
                  const depth = getNodeDepth(node.id);
                  if (!nodesByLevel.has(depth)) nodesByLevel.set(depth, []);
                  nodesByLevel.get(depth)!.push(node);
                });

                return (
                  <div 
                    className="relative" 
                    style={{ minHeight: `${containerHeight}px`, minWidth: `${containerWidth}px` }}
                  >
                    {/* SVG pour les lignes en forme d'arbre (angles droits) */}
                    <svg
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{ height: `${containerHeight}px`, width: `${containerWidth}px` }}
                    >
                      {/* Dessiner les connexions parent -> enfants */}
                      {Array.from(nodesByLevel.entries()).map(([depth, nodesAtLevel]) => {
                        return nodesAtLevel.map(node => {
                          // Trouver les enfants de ce nœud
                          const children = nodesToShow.filter(n => n.parentId === node.id);
                          if (children.length === 0) return null;

                          const parentPos = positions.get(node.id);
                          if (!parentPos) return null;

                          // Position Y du point de jonction (à mi-chemin entre parent et enfants)
                          const nodeHeight = 32 * zoom;
                          const midY = parentPos.y + levelSpacing / 2;

                          // Trouver les positions X des enfants
                          const childrenPositions = children
                            .map(child => positions.get(child.id))
                            .filter(Boolean) as { x: number; y: number }[];

                          if (childrenPositions.length === 0) return null;

                          const minChildX = Math.min(...childrenPositions.map(p => p.x));
                          const maxChildX = Math.max(...childrenPositions.map(p => p.x));

                          return (
                            <g key={`connector-${node.id}`}>
                              {/* Ligne verticale du parent vers le milieu */}
                              <line
                                x1={parentPos.x}
                                y1={parentPos.y + nodeHeight / 2}
                                x2={parentPos.x}
                                y2={midY}
                                stroke="rgba(0, 0, 0, 0.3)"
                                strokeWidth="3"
                              />
                              <line
                                x1={parentPos.x}
                                y1={parentPos.y + nodeHeight / 2}
                                x2={parentPos.x}
                                y2={midY}
                                stroke="rgb(34, 211, 238)"
                                strokeWidth="2"
                              />

                              {/* Ligne horizontale entre les enfants (si plus d'un enfant) */}
                              {childrenPositions.length > 1 && (
                                <>
                                  <line
                                    x1={minChildX}
                                    y1={midY}
                                    x2={maxChildX}
                                    y2={midY}
                                    stroke="rgba(0, 0, 0, 0.3)"
                                    strokeWidth="3"
                                  />
                                  <line
                                    x1={minChildX}
                                    y1={midY}
                                    x2={maxChildX}
                                    y2={midY}
                                    stroke="rgb(34, 211, 238)"
                                    strokeWidth="2"
                                  />
                                </>
                              )}

                              {/* Lignes verticales vers chaque enfant */}
                              {childrenPositions.map((childPos, idx) => (
                                <g key={`child-line-${idx}`}>
                                  <line
                                    x1={childPos.x}
                                    y1={midY}
                                    x2={childPos.x}
                                    y2={childPos.y - nodeHeight / 2}
                                    stroke="rgba(0, 0, 0, 0.3)"
                                    strokeWidth="3"
                                  />
                                  <line
                                    x1={childPos.x}
                                    y1={midY}
                                    x2={childPos.x}
                                    y2={childPos.y - nodeHeight / 2}
                                    stroke="rgb(34, 211, 238)"
                                    strokeWidth="2"
                                  />
                                </g>
                              ))}
                            </g>
                          );
                        });
                      })}

                      {/* Liens cycliques (retours) en pointillés orange */}
                      {nodesToShow.map(node => {
                        // Pour chaque choix du nœud, vérifier si c'est un lien cyclique
                        return node.choices.map((choice, idx) => {
                          if (!choice.nextNodeId) return null;

                          // Vérifier si c'est un lien cyclique (cible n'est PAS un enfant direct)
                          const isCyclicLink = nodesToShow.find(n => n.id === choice.nextNodeId)?.parentId !== node.id;

                          if (!isCyclicLink) return null; // Pas un cycle, déjà rendu au-dessus

                          const fromPos = positions.get(node.id);
                          const toPos = positions.get(choice.nextNodeId);

                          if (!fromPos || !toPos) return null;

                          // Calculer une courbe qui part du côté droit du nœud source
                          // et arrive sur le côté gauche ou haut du nœud cible
                          const offsetX = 80; // Décalage horizontal pour éviter les autres liens
                          const controlPointX1 = fromPos.x + offsetX;
                          const controlPointY1 = fromPos.y;
                          const controlPointX2 = toPos.x - offsetX;
                          const controlPointY2 = toPos.y;

                          return (
                            <g key={`cycle-${node.id}-${choice.nextNodeId}-${idx}`}>
                              {/* Courbe de Bézier cubique en pointillés */}
                              <path
                                d={`M ${fromPos.x + 60} ${fromPos.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPos.x - 60} ${toPos.y}`}
                                stroke="rgba(251, 146, 60, 0.4)"
                                strokeWidth="4"
                                strokeDasharray="8 6"
                                fill="none"
                              />
                              <path
                                d={`M ${fromPos.x + 60} ${fromPos.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPos.x - 60} ${toPos.y}`}
                                stroke="rgb(251, 146, 60)"
                                strokeWidth="2"
                                strokeDasharray="8 6"
                                fill="none"
                              />

                              {/* Flèche à la fin */}
                              <polygon
                                points={`${toPos.x - 60},${toPos.y} ${toPos.x - 70},${toPos.y - 6} ${toPos.x - 70},${toPos.y + 6}`}
                                fill="rgb(251, 146, 60)"
                              />
                            </g>
                          );
                        });
                      })}
                    </svg>

                    {/* Nœuds */}
                    {nodesToShow.map((node) => {
                      const pos = positions.get(node.id);
                      if (!pos) return null;

                      // Taille des nœuds ajustée par le zoom
                      const nodeMinWidth = 65 * zoom;
                      const nodeMinHeight = 32 * zoom;
                      const nodeMaxWidth = 120 * zoom;
                      const fontSize = Math.max(9, 11 * zoom);

                      return (
                        <div
                          key={node.id}
                          data-node-id={node.id}
                          className="absolute cursor-pointer transition-all duration-200 hover:scale-110"
                          style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            transform: "translate(-50%, -50%)",
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNodeSelect(node);
                          }}
                        >
                          <div
                            className={`rounded-lg flex flex-col items-center justify-center font-semibold transition-all shadow-md ${
                              currentNode?.id === node.id
                                ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-yellow-400 text-white shadow-lg shadow-cyan-500/50 ring-2 ring-yellow-400/50"
                                : node.isEnd
                                ? "bg-gradient-to-br from-green-600 to-emerald-700 border-2 border-green-400 text-white"
                                : "bg-gradient-to-br from-slate-700 to-slate-800 border border-cyan-400/50 text-cyan-100 hover:from-cyan-600 hover:to-blue-700"
                            }`}
                            style={{ 
                              width: `${nodeMaxWidth}px`,
                              minWidth: `${nodeMinWidth}px`,
                              minHeight: `${nodeMinHeight}px`, 
                              maxWidth: `${nodeMaxWidth}px`,
                              fontSize: `${fontSize}px`,
                              padding: `${4 * zoom}px ${8 * zoom}px`,
                              overflow: 'hidden'
                            }}
                            title={node.label || "Début"}
                          >
                            <span className="block w-full truncate text-center leading-tight" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label || "Début"}</span>
                            {node.isEnd && <span style={{ fontSize: `${8 * zoom}px` }} className="mt-0.5 text-green-400">FIN</span>}
                          </div>
                          {currentNode?.id === node.id && (
                            <div className="absolute -top-2 -right-2 animate-bounce text-yellow-400 font-bold" style={{ fontSize: `${10 * zoom}px` }}>●</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/40 text-xs">Aucun nœud</p>
            </div>
          )}
        </div>

        {/* Bouton plein écran en bas */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 sm:py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-cyan-400 hover:text-cyan-300 transition-all text-xs sm:text-xs cursor-pointer touch-manipulation"
          title="Vue plein écran"
          type="button"
        >
          <svg
            className="w-4 h-4 sm:w-3.5 sm:h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          Plein écran
        </button>
      </div>

      {/* Modal plein écran - Rendu via portail pour éviter les problèmes de z-index */}
      {isMounted && isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            // Fermer le modal si on clique sur le backdrop
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="h-full flex flex-col p-4 md:p-8">
            {/* Header du modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span className="truncate">Arborescence complète</span>
                </h2>
                {currentNode && (
                  <p className="text-cyan-400 text-xs md:text-sm mt-1 ml-7 md:ml-9 flex items-center gap-2">
                    <span className="text-white/50 flex-shrink-0">Nœud actuel:</span>
                    <span className="font-semibold truncate" title={currentNode.label || "Début"} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentNode.label || "Début"}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                {/* Bouton pour recentrer sur le nœud actuel */}
                {currentNode && (
                  <button
                    onClick={() => centerNode(currentNode.id)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 hover:bg-cyan-500/10 rounded-lg flex items-center gap-2"
                    title="Recentrer sur le nœud actuel"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-xs md:text-sm hidden sm:inline">Recentrer</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg cursor-pointer"
                  type="button"
                  aria-label="Fermer"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div
              ref={containerRef}
              className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-8 overflow-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              {(() => {
                const nodesToShow = nodes;

                // Calculer la profondeur de chaque nœud avec détection de cycle
                const getNodeDepth = (nodeId: string, visited: Set<string> = new Set()): number => {
                  // Détection de cycle
                  if (visited.has(nodeId)) {
                    console.warn(`Cycle détecté pour le nœud ${nodeId}`);
                    return 0;
                  }

                  const node = nodesToShow.find(n => n.id === nodeId);
                  if (!node || !node.parentId) return 0;

                  // Marquer comme visité
                  const newVisited = new Set(visited);
                  newVisited.add(nodeId);

                  return getNodeDepth(node.parentId, newVisited) + 1;
                };

                // Trouver la profondeur max
                let maxDepth = 0;
                nodesToShow.forEach(node => {
                  maxDepth = Math.max(maxDepth, getNodeDepth(node.id));
                });

                // Paramètres de layout en PIXELS pour le modal (responsive)
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                const startY = isMobile ? 60 : 80;
                const levelSpacing = isMobile ? 120 : 150;
                const nodeSpacing = isMobile ? 160 : 200;

                // Calculer les positions avec l'algorithme récursif
                const positions = new Map<string, { x: number; y: number }>();
                const subtreeWidths = new Map<string, number>();

                const getSubtreeWidth = (nodeId: string, visited: Set<string> = new Set()): number => {
                  if (subtreeWidths.has(nodeId)) return subtreeWidths.get(nodeId)!;

                  // Détection de cycle
                  if (visited.has(nodeId)) {
                    console.warn(`Cycle détecté dans getSubtreeWidth pour le nœud ${nodeId}`);
                    subtreeWidths.set(nodeId, 1);
                    return 1;
                  }

                  const children = nodesToShow.filter(n => n.parentId === nodeId);
                  if (children.length === 0) {
                    subtreeWidths.set(nodeId, 1);
                    return 1;
                  }

                  const newVisited = new Set(visited);
                  newVisited.add(nodeId);

                  const width = children.reduce((sum, child) => sum + getSubtreeWidth(child.id, newVisited), 0);
                  subtreeWidths.set(nodeId, width);
                  return width;
                };

                const positioningNodes = new Set<string>();
                const positionSubtree = (nodeId: string, depth: number, leftX: number): number => {
                  const node = nodesToShow.find(n => n.id === nodeId);
                  if (!node) return leftX;

                  // Détection de cycle - si déjà en cours de positionnement, ignorer
                  if (positioningNodes.has(nodeId)) {
                    console.warn(`Cycle détecté lors du positionnement du nœud ${nodeId}`);
                    return leftX;
                  }

                  // Si déjà positionné, retourner
                  if (positions.has(nodeId)) {
                    return leftX + nodeSpacing;
                  }

                  positioningNodes.add(nodeId);

                  const children = nodesToShow.filter(n => n.parentId === nodeId);
                  const y = startY + depth * levelSpacing;

                  if (children.length === 0) {
                    const x = leftX + nodeSpacing / 2;
                    positions.set(nodeId, { x, y });
                    positioningNodes.delete(nodeId);
                    return leftX + nodeSpacing;
                  }

                  let currentX = leftX;
                  children.forEach(child => {
                    currentX = positionSubtree(child.id, depth + 1, currentX);
                  });

                  const childPositions = children.map(c => positions.get(c.id)).filter(p => p !== undefined);
                  if (childPositions.length > 0) {
                    const minChildX = Math.min(...childPositions.map(p => p!.x));
                    const maxChildX = Math.max(...childPositions.map(p => p!.x));
                    const x = (minChildX + maxChildX) / 2;
                    positions.set(nodeId, { x, y });
                  } else {
                    const x = leftX + nodeSpacing / 2;
                    positions.set(nodeId, { x, y });
                  }

                  positioningNodes.delete(nodeId);
                  return currentX;
                };

                const rootNode = nodesToShow.find(n => !n.parentId);
                let totalWidth = nodeSpacing;
                if (rootNode) {
                  totalWidth = positionSubtree(rootNode.id, 0, 0);
                }

                const containerWidth = Math.max(900, totalWidth + 100);
                const containerHeight = Math.max(500, startY + (maxDepth + 1) * levelSpacing + 80);

                // Centrer l'arbre
                const offsetX = Math.max(50, (containerWidth - totalWidth) / 2);
                positions.forEach((pos, nodeId) => {
                  positions.set(nodeId, { x: pos.x + offsetX, y: pos.y });
                });

                // Grouper les nœuds par niveau
                const nodesByLevel = new Map<number, typeof nodesToShow>();
                nodesToShow.forEach(node => {
                  const depth = getNodeDepth(node.id);
                  if (!nodesByLevel.has(depth)) nodesByLevel.set(depth, []);
                  nodesByLevel.get(depth)!.push(node);
                });

                const nodeHeight = 60;

                return (
                  <div className="relative" style={{ minHeight: `${containerHeight}px`, minWidth: `${containerWidth}px` }}>
                    {nodes.length > 0 && (
                      <>
                        {/* SVG pour les lignes en angles droits */}
                        <svg
                          className="absolute top-0 left-0 pointer-events-none"
                          style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
                        >
                          {/* Liens normaux (parent -> enfant) */}
                          {Array.from(nodesByLevel.entries()).map(([depth, nodesAtLevel]) => {
                            return nodesAtLevel.map(node => {
                              const children = nodesToShow.filter(n => n.parentId === node.id);
                              if (children.length === 0) return null;

                              const parentPos = positions.get(node.id);
                              if (!parentPos) return null;

                              const midY = parentPos.y + levelSpacing / 2;
                              const childrenPositions = children
                                .map(child => positions.get(child.id))
                                .filter(Boolean) as { x: number; y: number }[];

                              if (childrenPositions.length === 0) return null;

                              const minChildX = Math.min(...childrenPositions.map(p => p.x));
                              const maxChildX = Math.max(...childrenPositions.map(p => p.x));

                              return (
                                <g key={`connector-${node.id}`}>
                                  {/* Ligne verticale du parent */}
                                  <line
                                    x1={parentPos.x} y1={parentPos.y + nodeHeight / 2}
                                    x2={parentPos.x} y2={midY}
                                    stroke="rgba(0, 0, 0, 0.3)" strokeWidth="4"
                                  />
                                  <line
                                    x1={parentPos.x} y1={parentPos.y + nodeHeight / 2}
                                    x2={parentPos.x} y2={midY}
                                    stroke="rgb(34, 211, 238)" strokeWidth="3"
                                  />

                                  {/* Ligne horizontale */}
                                  {childrenPositions.length > 1 && (
                                    <>
                                      <line
                                        x1={minChildX} y1={midY}
                                        x2={maxChildX} y2={midY}
                                        stroke="rgba(0, 0, 0, 0.3)" strokeWidth="4"
                                      />
                                      <line
                                        x1={minChildX} y1={midY}
                                        x2={maxChildX} y2={midY}
                                        stroke="rgb(34, 211, 238)" strokeWidth="3"
                                      />
                                    </>
                                  )}

                                  {/* Lignes verticales vers les enfants */}
                                  {childrenPositions.map((childPos, idx) => (
                                    <g key={`child-line-${idx}`}>
                                      <line
                                        x1={childPos.x} y1={midY}
                                        x2={childPos.x} y2={childPos.y - nodeHeight / 2}
                                        stroke="rgba(0, 0, 0, 0.3)" strokeWidth="4"
                                      />
                                      <line
                                        x1={childPos.x} y1={midY}
                                        x2={childPos.x} y2={childPos.y - nodeHeight / 2}
                                        stroke="rgb(34, 211, 238)" strokeWidth="3"
                                      />
                                    </g>
                                  ))}
                                </g>
                              );
                            });
                          })}

                          {/* Liens cycliques (retours) en pointillés orange */}
                          {nodesToShow.map(node => {
                            // Pour chaque choix du nœud, vérifier si c'est un lien cyclique
                            return node.choices.map((choice, idx) => {
                              if (!choice.nextNodeId) return null;

                              // Vérifier si c'est un lien cyclique (cible n'est PAS un enfant direct)
                              const isCyclicLink = nodesToShow.find(n => n.id === choice.nextNodeId)?.parentId !== node.id;

                              if (!isCyclicLink) return null; // Pas un cycle, déjà rendu au-dessus

                              const fromPos = positions.get(node.id);
                              const toPos = positions.get(choice.nextNodeId);

                              if (!fromPos || !toPos) return null;

                              // Calculer une courbe qui part du côté droit du nœud source
                              // et arrive sur le côté gauche ou haut du nœud cible
                              const offsetX = 80; // Décalage horizontal pour éviter les autres liens
                              const controlPointX1 = fromPos.x + offsetX;
                              const controlPointY1 = fromPos.y;
                              const controlPointX2 = toPos.x - offsetX;
                              const controlPointY2 = toPos.y;

                              return (
                                <g key={`cycle-${node.id}-${choice.nextNodeId}-${idx}`}>
                                  {/* Courbe de Bézier cubique en pointillés */}
                                  <path
                                    d={`M ${fromPos.x + 60} ${fromPos.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPos.x - 60} ${toPos.y}`}
                                    stroke="rgba(251, 146, 60, 0.4)"
                                    strokeWidth="4"
                                    strokeDasharray="8 6"
                                    fill="none"
                                  />
                                  <path
                                    d={`M ${fromPos.x + 60} ${fromPos.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPos.x - 60} ${toPos.y}`}
                                    stroke="rgb(251, 146, 60)"
                                    strokeWidth="2"
                                    strokeDasharray="8 6"
                                    fill="none"
                                  />

                                  {/* Flèche à la fin */}
                                  <polygon
                                    points={`${toPos.x - 60},${toPos.y} ${toPos.x - 70},${toPos.y - 6} ${toPos.x - 70},${toPos.y + 6}`}
                                    fill="rgb(251, 146, 60)"
                                  />
                                </g>
                              );
                            });
                          })}
                        </svg>

                        {/* Nœuds */}
                        {nodes.map((node) => {
                          const pos = positions.get(node.id);
                          if (!pos) return null;

                          return (
                            <div
                              key={node.id}
                              ref={(el) => setNodeRef(node.id, el)}
                              className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                              style={{
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                                zIndex: 10,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onNodeSelect(node);
                              }}
                            >
                              <div
                                className={`px-3 py-3 md:px-5 md:py-4 rounded-lg md:rounded-xl backdrop-blur-sm transition-all shadow-xl ${
                                  currentNode?.id === node.id
                                    ? "bg-gradient-to-br from-cyan-500/50 to-blue-500/50 border-2 border-yellow-400 text-white shadow-2xl shadow-cyan-500/50 scale-105 md:scale-110 ring-4 ring-yellow-400/30"
                                    : node.isEnd
                                    ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 text-green-100 hover:from-green-500/40 hover:to-emerald-500/40 hover:scale-105"
                                    : "bg-gradient-to-br from-white/10 to-white/5 border-2 border-cyan-400/40 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-300 hover:scale-105"
                                }`}
                                style={{ minWidth: isMobile ? '140px' : '180px', maxWidth: isMobile ? '180px' : '220px', overflow: 'hidden' }}
                              >
                                <div className="text-center">
                                  <div className="text-base md:text-lg font-bold mb-1 truncate" title={node.label || "Début"} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {node.label || "Début"}
                                  </div>
                                  <p className={`text-xs whitespace-nowrap ${
                                    node.isEnd ? "text-green-200" : "text-white/60"
                                  }`}>
                                    {node.isEnd
                                      ? "Fin de l'histoire"
                                      : `${node.choices.length} choix disponible${node.choices.length > 1 ? 's' : ''}`}
                                  </p>
                                </div>
                              </div>
                              {currentNode?.id === node.id && (
                                <div className="absolute -top-2 -right-2 text-xl animate-bounce text-yellow-400">
                                  ●
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}

                    {nodes.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-white/50 text-lg mb-2">
                            Aucun nœud créé
                          </p>
                          <p className="text-white/30 text-sm">
                            Commencez à écrire votre histoire !
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Statistiques et légende */}
            <div className="mt-4 md:mt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Statistiques */}
              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span className="text-white/70 whitespace-nowrap">
                    <span className="font-semibold text-white">{nodes.length}</span> nœud{nodes.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70 whitespace-nowrap">
                    <span className="font-semibold text-white">{nodes.filter(n => n.isEnd).length}</span> fin{nodes.filter(n => n.isEnd).length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/70 whitespace-nowrap">
                    <span className="font-semibold text-white">{nodes.reduce((sum, n) => sum + n.choices.length, 0)}</span> choix
                  </span>
                </div>
              </div>

              {/* Légende */}
              <div className="flex flex-wrap items-center gap-3 md:gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded border-2 border-red-500 bg-cyan-500/30 flex-shrink-0"></div>
                  <span className="text-white/70 text-xs md:text-sm whitespace-nowrap">Nœud actuel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded border border-cyan-400/30 bg-white/10 flex-shrink-0"></div>
                  <span className="text-white/70 text-xs md:text-sm whitespace-nowrap">Nœud inactif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded border-2 border-green-400 bg-green-500/30 flex-shrink-0"></div>
                  <span className="text-white/70 text-xs md:text-sm whitespace-nowrap">
                    Fin de l&apos;histoire
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
