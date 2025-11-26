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
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const miniContainerRef = useRef<HTMLDivElement>(null);

  // Vérifier que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
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

    // Nettoyer le cache si les nœuds ont changé
    if (levelCache.current.size > nodes.length) {
      levelCache.current.clear();
    }

    // Calculer la profondeur de chaque nœud depuis la racine
    const getDepth = (nodeId: string): number => {
      if (levelCache.current.has(nodeId)) {
        return levelCache.current.get(nodeId)!;
      }
      const n = nodes.find((nd) => nd.id === nodeId);
      if (!n || !n.parentId) {
        levelCache.current.set(nodeId, 0);
        return 0;
      }
      const depth = getDepth(n.parentId) + 1;
      levelCache.current.set(nodeId, depth);
      return depth;
    };

    // Calculer la profondeur maximale de l'arbre
    const maxDepth = Math.max(...nodesToProcess.map(n => getDepth(n.id)), 0);

    // Espacement vertical adaptatif basé sur la profondeur - COMPACT
    const getVerticalSpacing = () => {
      if (maxNodes) {
        // Vue minimaliste : espacement très compact (8-12% par niveau)
        return Math.max(8, Math.min(12, 80 / (maxDepth + 1)));
      }
      // Vue complète : espacement compact (80-100px par niveau)
      return Math.max(80, Math.min(100, 400 / (maxDepth + 1)));
    };

    const verticalSpacing = getVerticalSpacing();

    // Compter les nœuds à chaque niveau pour l'espacement horizontal
    const nodesPerLevel = new Map<number, StoryNode[]>();
    nodesToProcess.forEach(node => {
      const depth = getDepth(node.id);
      if (!nodesPerLevel.has(depth)) {
        nodesPerLevel.set(depth, []);
      }
      nodesPerLevel.get(depth)!.push(node);
    });

    // Positionner les nœuds niveau par niveau
    const positionedNodes = new Set<string>();

    const positionNode = (nodeId: string, preferredX?: number): number => {
      if (positionedNodes.has(nodeId)) {
        return positions.get(nodeId)?.x || 50;
      }

      const node = nodesToProcess.find((n) => n.id === nodeId);
      if (!node) return 50;

      const depth = getDepth(nodeId);
      const children = nodesToProcess.filter((n) => n.parentId === nodeId);

      let x: number;

      if (children.length > 0) {
        // Positionner d'abord les enfants
        const childXPositions: number[] = [];
        const levelNodes = nodesPerLevel.get(depth + 1) || [];
        const childrenInLevel = children.filter(c => levelNodes.includes(c));

        childrenInLevel.forEach((child, idx) => {
          // Espacement horizontal COMPACT entre frères
          const spreadFactor = Math.max(8, Math.min(20, 60 / childrenInLevel.length));
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

      // Calculer y en pixels pour la vue complète, en pourcentage pour la vue mini
      const y = maxNodes
        ? depth * verticalSpacing + 5  // Pourcentage pour mini vue - marge réduite
        : depth * verticalSpacing + 30; // Pixels pour vue complète - marge réduite

      positions.set(nodeId, { x, y });
      positionedNodes.add(nodeId);

      return x;
    };

    // Trouver le nœud racine et commencer le positionnement
    const rootNode = nodesToProcess.find((n) => !n.parentId);
    if (rootNode) {
      positionNode(rootNode.id, 50);
    }

    return positions;
  };

  return (
    <>
      {/* Vue minimaliste - Plus grande et scrollable */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-cyan-400/30 shadow-xl p-4 w-96">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <svg
                className="w-4 h-4 text-cyan-400"
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
              <h3 className="text-white font-bold text-sm">Carte d'Histoire</h3>
              <p className="text-cyan-300 text-xs">{nodes.length} nœud{nodes.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 transition-all p-2 hover:bg-cyan-500/20 rounded-lg group"
            title="Vue plein écran"
            type="button"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
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
          </button>
        </div>

        {/* Visualisation graphique scrollable */}
        <div ref={miniContainerRef} className="relative h-72 bg-black/30 rounded-xl overflow-auto border border-cyan-400/20 shadow-inner"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(34, 211, 238, 0.3) rgba(0, 0, 0, 0.2)'
          }}
        >
          {nodes.length > 0 ? (
            <>
              {(() => {
                // Afficher tous les nœuds dans la vue minimaliste
                const nodesToShow = nodes;

                // Calculer les positions pour TOUS les nœuds
                const positions = calculatePositions();

                // Calculer la taille nécessaire du conteneur en pixels - COMPACT
                let maxY = 0;
                positions.forEach(pos => {
                  maxY = Math.max(maxY, pos.y);
                });

                // Hauteur du conteneur réduite pour être plus compact
                // Conversion: maxY est en %, on le multiplie par un facteur réduit
                const containerHeight = Math.max(250, (maxY / 100) * 400 + 60);

                return (
                  <div className="relative w-full" style={{ minHeight: `${containerHeight}px` }}>
                    {/* SVG pour les lignes */}
                    <svg
                      className="absolute top-0 left-0 w-full pointer-events-none"
                      style={{ height: `${containerHeight}px` }}
                    >
                      {nodesToShow.map((node) => {
                        if (!node.parentId) return null;

                        const parentPos = positions.get(node.parentId);
                        const childPos = positions.get(node.id);

                        if (!parentPos || !childPos) return null;

                        // Convertir les positions en pixels pour le SVG
                        const y1 = (parentPos.y / 100) * containerHeight;
                        const y2 = (childPos.y / 100) * containerHeight;

                        return (
                          <g key={`line-${node.id}`}>
                            {/* Ligne d'ombre fine */}
                            <line
                              x1={`${parentPos.x}%`}
                              y1={y1}
                              x2={`${childPos.x}%`}
                              y2={y2}
                              stroke="rgba(0, 0, 0, 0.3)"
                              strokeWidth="2"
                            />
                            {/* Ligne principale fine */}
                            <line
                              x1={`${parentPos.x}%`}
                              y1={y1}
                              x2={`${childPos.x}%`}
                              y2={y2}
                              stroke="rgb(34, 211, 238)"
                              strokeWidth="1.5"
                              strokeDasharray={currentNode?.id === node.id || currentNode?.id === node.parentId ? "0" : "3 2"}
                              className="opacity-60"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Nœuds */}
                    {nodesToShow.map((node, idx) => {
                      const pos = positions.get(node.id);
                      if (!pos) {
                        console.warn(`⚠️ Pas de position pour le nœud: ${node.label} (${node.id})`);
                        return null;
                      }

                      // Log pour le débogage - seulement pour la première fois
                      if (idx === 0) {
                        console.log(`📍 Positions des nœuds:`, nodesToShow.map(n => {
                          const p = positions.get(n.id);
                          return { label: n.label, x: p?.x, y: p?.y };
                        }));
                      }

                      return (
                        <div
                          key={node.id}
                          data-node-id={node.id}
                          className="absolute cursor-pointer transition-all duration-200 hover:scale-105"
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: "translate(-50%, -50%)",
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`🖱️ Clic sur nœud: ${node.label} (${node.id})`);
                            onNodeSelect(node);
                          }}
                        >
                          <div
                            className={`px-2 py-1.5 rounded-md flex flex-col items-center justify-center text-[11px] font-semibold transition-all shadow-md ${
                              currentNode?.id === node.id
                                ? "bg-gradient-to-br from-cyan-500/50 to-blue-500/50 border-2 border-yellow-400 text-white shadow-lg shadow-cyan-500/40 scale-105 ring-1 ring-yellow-400/50"
                                : node.isEnd
                                ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-400/50 text-green-100 hover:from-green-500/40 hover:to-emerald-500/40"
                                : "bg-gradient-to-br from-white/10 to-white/5 border border-cyan-400/40 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-300"
                            }`}
                            style={{ minWidth: "55px", minHeight: "32px", maxWidth: "110px" }}
                            title={node.label || "Début"}
                          >
                            <span className="truncate text-center leading-tight">{node.label || "Début"}</span>
                            {node.isEnd && (
                              <span className="text-[9px] text-green-300 mt-0.5">🏁</span>
                            )}
                          </div>
                          {currentNode?.id === node.id && (
                            <div className="absolute -top-1 -right-1 text-sm animate-bounce">
                              📍
                            </div>
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

        {/* Aide à la navigation */}
        <div className="mt-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
          <div className="flex items-center justify-center gap-4 text-xs text-cyan-300">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Clic = naviguer
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              Scroll = explorer
            </span>
          </div>
        </div>
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
          <div className="h-full flex flex-col p-8">
            {/* Header du modal */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-cyan-400"
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
                  Arborescence complète
                </h2>
                {currentNode && (
                  <p className="text-cyan-400 text-sm mt-1 ml-9 flex items-center gap-2">
                    <span className="text-white/50">Nœud actuel:</span>
                    <span className="font-semibold">{currentNode.label || "Début"}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Bouton pour recentrer sur le nœud actuel */}
                {currentNode && (
                  <button
                    onClick={() => centerNode(currentNode.id)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 hover:bg-cyan-500/10 rounded-lg flex items-center gap-2"
                    title="Recentrer sur le nœud actuel"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
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
                    <span className="text-sm">Recentrer</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  type="button"
                >
                  <svg
                    className="w-6 h-6"
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
              className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 overflow-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              {(() => {
                const positions = calculatePositions();

                // Calculer la hauteur et largeur nécessaires - VERSION COMPACTE
                let maxY = 0;
                let maxX = 0;
                positions.forEach(pos => {
                  maxY = Math.max(maxY, pos.y);
                  maxX = Math.max(maxX, pos.x);
                });

                // Réduire les marges et la taille pour plus de compacité
                const containerHeight = Math.max(500, maxY + 100);
                const containerWidth = Math.max(900, (maxX / 100) * 1000);

                return (
                  <div className="relative w-full" style={{ minHeight: `${containerHeight}px`, minWidth: `${containerWidth}px` }}>
                    {nodes.length > 0 && (
                      <>
                        {/* SVG pour les lignes */}
                        <svg
                          className="absolute inset-0 pointer-events-none"
                          style={{ zIndex: 0, width: `${containerWidth}px`, height: `${containerHeight}px` }}
                        >
                          {nodes.map((node) => {
                            if (!node.parentId) return null;

                            const parentPos = positions.get(node.parentId);
                            const childPos = positions.get(node.id);

                            if (!parentPos || !childPos) return null;

                            // Convertir les positions en pixels
                            const x1 = (parentPos.x / 100) * containerWidth;
                            const y1 = parentPos.y;
                            const x2 = (childPos.x / 100) * containerWidth;
                            const y2 = childPos.y;

                            return (
                              <g key={`line-${node.id}`}>
                                {/* Ligne d'ombre */}
                                <line
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke="rgba(0, 0, 0, 0.3)"
                                  strokeWidth="3"
                                />
                                {/* Ligne principale */}
                                <line
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke="rgb(34, 211, 238)"
                                  strokeWidth="2"
                                  strokeDasharray={currentNode?.id === node.id || currentNode?.id === node.parentId ? "0" : "4 2"}
                                  className="opacity-70"
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Nœuds */}
                        {nodes.map((node) => {
                          const pos = positions.get(node.id);
                          if (!pos) return null;

                          // Convertir la position x en pixels
                          const xPos = (pos.x / 100) * containerWidth;

                          return (
                            <div
                              key={node.id}
                              ref={(el) => setNodeRef(node.id, el)}
                              className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                              style={{
                                left: `${xPos}px`,
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                                zIndex: 10,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(`🖱️ Clic sur nœud (modal): ${node.label} (${node.id})`);
                                onNodeSelect(node);
                              }}
                            >
                              <div
                                className={`px-5 py-4 rounded-xl backdrop-blur-sm transition-all shadow-xl ${
                                  currentNode?.id === node.id
                                    ? "bg-gradient-to-br from-cyan-500/50 to-blue-500/50 border-2 border-yellow-400 text-white shadow-2xl shadow-cyan-500/50 scale-110 ring-4 ring-yellow-400/30"
                                    : node.isEnd
                                    ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 text-green-100 hover:from-green-500/40 hover:to-emerald-500/40 hover:scale-105"
                                    : "bg-gradient-to-br from-white/10 to-white/5 border-2 border-cyan-400/40 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-300 hover:scale-105"
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-lg font-bold mb-1">
                                    {node.label || "Début"}
                                  </div>
                                  <p className={`text-xs whitespace-nowrap ${
                                    node.isEnd ? "text-green-200" : "text-white/60"
                                  }`}>
                                    {node.isEnd
                                      ? "🏁 Fin de l'histoire"
                                      : `📝 ${node.choices.length} choix disponible${node.choices.length > 1 ? 's' : ''}`}
                                  </p>
                                </div>
                              </div>
                              {currentNode?.id === node.id && (
                                <div className="absolute -top-2 -right-2 text-xl animate-bounce">
                                  📍
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
            <div className="mt-6 flex items-center justify-between">
              {/* Statistiques */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span className="text-white/70">
                    <span className="font-semibold text-white">{nodes.length}</span> nœud{nodes.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-lg">🏁</span>
                  <span className="text-white/70">
                    <span className="font-semibold text-white">{nodes.filter(n => n.isEnd).length}</span> fin{nodes.filter(n => n.isEnd).length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/70">
                    <span className="font-semibold text-white">{nodes.reduce((sum, n) => sum + n.choices.length, 0)}</span> choix
                  </span>
                </div>
              </div>

              {/* Légende */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border-2 border-red-500 bg-cyan-500/30"></div>
                  <span className="text-white/70 text-sm">Nœud actuel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-cyan-400/30 bg-white/10"></div>
                  <span className="text-white/70 text-sm">Nœud inactif</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-lg">🏁</span>
                  <span className="text-white/70 text-sm">
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

