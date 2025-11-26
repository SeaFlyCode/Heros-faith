"use client";

import { useState } from "react";

interface StoryNode {
  id: string;
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
  currentNode: StoryNode;
  onNodeSelect: (node: StoryNode) => void;
}

export default function StoryTreeVisualization({
  nodes,
  currentNode,
  onNodeSelect,
}: StoryTreeVisualizationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Algorithme de positionnement pour éviter les superpositions
  const calculatePositions = (maxNodes?: number) => {
    const nodesToProcess = maxNodes ? nodes.slice(0, maxNodes) : nodes;
    const positions = new Map<string, { x: number; y: number }>();
    const usedXPositions = new Map<number, Set<number>>();

    const getLevel = (nodeId: string, depth = 0): number => {
      const n = nodes.find((nd) => nd.id === nodeId);
      if (!n || !n.parentId) return depth;
      return getLevel(n.parentId, depth + 1);
    };

    const reservePosition = (level: number, x: number) => {
      if (!usedXPositions.has(level)) {
        usedXPositions.set(level, new Set());
      }
      usedXPositions.get(level)!.add(Math.round(x));
    };

    const isPositionAvailable = (
      level: number,
      x: number,
      minDistance: number = 8
    ): boolean => {
      if (!usedXPositions.has(level)) return true;
      const used = usedXPositions.get(level)!;
      const roundedX = Math.round(x);
      for (const usedX of used) {
        if (Math.abs(usedX - roundedX) < minDistance) return false;
      }
      return true;
    };

    const findAvailablePosition = (
      level: number,
      preferredX: number,
      minDistance: number = 8
    ): number => {
      if (isPositionAvailable(level, preferredX, minDistance))
        return preferredX;

      for (let offset = minDistance; offset < 50; offset += minDistance) {
        const leftX = preferredX - offset;
        const rightX = preferredX + offset;

        if (
          leftX >= 10 &&
          isPositionAvailable(level, leftX, minDistance)
        )
          return leftX;
        if (
          rightX <= 90 &&
          isPositionAvailable(level, rightX, minDistance)
        )
          return rightX;
      }

      return preferredX;
    };

    const positionNode = (nodeId: string, xMin: number, xMax: number) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const level = getLevel(nodeId);
      const children = nodes.filter((n) => n.parentId === nodeId);

      let x = (xMin + xMax) / 2;
      x = findAvailablePosition(level, x);
      x = Math.max(10, Math.min(90, x));

      positions.set(nodeId, { x, y: level * 30 + 10 });
      reservePosition(level, x);

      if (children.length > 0) {
        const totalWidth = xMax - xMin;
        const widthPerChild = totalWidth / children.length;

        children.forEach((child, idx) => {
          const childXMin = xMin + idx * widthPerChild;
          const childXMax = xMin + (idx + 1) * widthPerChild;
          positionNode(child.id, childXMin, childXMax);
        });
      }
    };

    const rootNode = nodesToProcess.find((n) => !n.parentId);
    if (rootNode) {
      positionNode(rootNode.id, 10, 90);
    }

    return positions;
  };

  return (
    <>
      {/* Vue minimaliste */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 p-3 w-64">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-xs flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-cyan-400"
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
            Arborescence
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 hover:bg-cyan-500/10 rounded"
            title="Agrandir"
            type="button"
          >
            <svg
              className="w-4 h-4"
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

        {/* Visualisation graphique minimaliste */}
        <div className="relative h-48 bg-black/20 rounded-lg overflow-hidden">
          {nodes.length > 0 ? (
            <>
              {(() => {
                const positions = calculatePositions(7);

                return (
                  <>
                    {/* SVG pour les lignes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {nodes.slice(0, 7).map((node) => {
                        if (!node.parentId) return null;

                        const parentPos = positions.get(node.parentId);
                        const childPos = positions.get(node.id);

                        if (!parentPos || !childPos) return null;

                        return (
                          <line
                            key={`line-${node.id}`}
                            x1={`${parentPos.x}%`}
                            y1={`${parentPos.y}%`}
                            x2={`${childPos.x}%`}
                            y2={`${childPos.y}%`}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-cyan-500/50"
                          />
                        );
                      })}
                    </svg>

                    {/* Nœuds */}
                    {nodes.slice(0, 7).map((node) => {
                      const pos = positions.get(node.id);
                      if (!pos) return null;

                      return (
                        <div
                          key={node.id}
                          className="absolute cursor-pointer transition-all duration-200 hover:scale-105"
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onClick={() => onNodeSelect(node)}
                        >
                          <div
                            className={`px-2 py-1 rounded flex items-center justify-center text-xs font-bold transition-all ${
                              currentNode.id === node.id
                                ? "bg-cyan-500/40 border-2 border-red-500 text-white shadow-lg shadow-cyan-500/30"
                                : "bg-white/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50"
                            }`}
                            style={{ minWidth: "24px", minHeight: "20px" }}
                          >
                            {node.id}
                          </div>
                          {currentNode.id === node.id && (
                            <div className="absolute -top-1 -right-1 text-xs animate-pulse">
                              📍
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/40 text-xs">Aucun nœud</p>
            </div>
          )}
        </div>

        {/* Info sur les nœuds cachés */}
        {nodes.length > 7 && (
          <p className="text-white/50 text-xs text-center mt-2">
            +{nodes.length - 7} nœuds
          </p>
        )}
      </div>

      {/* Modal plein écran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="h-full flex flex-col p-8">
            {/* Header du modal */}
            <div className="flex items-center justify-between mb-6">
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

            {/* Contenu du modal */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div
                  className="relative max-w-6xl mx-auto"
                  style={{ minHeight: "600px" }}
                >
                  {nodes.length > 0 && (
                    <>
                      {(() => {
                        const positions = calculatePositions();

                        return (
                          <>
                            {/* SVG pour les lignes */}
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ zIndex: 0 }}
                            >
                              {nodes.map((node) => {
                                if (!node.parentId) return null;

                                const parentPos = positions.get(node.parentId);
                                const childPos = positions.get(node.id);

                                if (!parentPos || !childPos) return null;

                                return (
                                  <line
                                    key={`line-${node.id}`}
                                    x1={`${parentPos.x}%`}
                                    y1={`${parentPos.y}%`}
                                    x2={`${childPos.x}%`}
                                    y2={`${childPos.y}%`}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-cyan-500/50"
                                  />
                                );
                              })}
                            </svg>

                            {/* Nœuds */}
                            {nodes.map((node) => {
                              const pos = positions.get(node.id);
                              if (!pos) return null;

                              return (
                                <div
                                  key={node.id}
                                  className="absolute cursor-pointer transition-all duration-200 hover:scale-105"
                                  style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 10,
                                  }}
                                  onClick={() => {
                                    onNodeSelect(node);
                                    setIsModalOpen(false);
                                  }}
                                >
                                  <div
                                    className={`px-4 py-3 rounded-lg backdrop-blur-sm transition-all ${
                                      currentNode.id === node.id
                                        ? "bg-cyan-500/40 border-2 border-red-500 shadow-xl shadow-cyan-500/40"
                                        : "bg-white/10 border border-cyan-400/30 hover:bg-cyan-500/20 hover:border-cyan-400/50"
                                    }`}
                                  >
                                    <div className="text-center">
                                      <div
                                        className={`text-lg font-bold mb-1 ${
                                          currentNode.id === node.id
                                            ? "text-white"
                                            : "text-cyan-300"
                                        }`}
                                      >
                                        {node.id}
                                      </div>
                                      <p className="text-white/70 text-xs whitespace-nowrap">
                                        {node.isEnd
                                          ? "🏁 Fin"
                                          : `${node.choices.length} choix`}
                                      </p>
                                    </div>
                                  </div>
                                  {currentNode.id === node.id && (
                                    <div className="absolute -top-1 -right-1 text-sm animate-pulse">
                                      📍
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
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
              </div>
            </div>

            {/* Légende */}
            <div className="mt-6 flex items-center justify-center gap-8">
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
      )}
    </>
  );
}

