"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PrismTransition from "@/components/PrismTransition";

interface StoryNode {
  id: string;
  context: string;
  choices: Choice[];
  isEnd: boolean;
}

interface Choice {
  id: string;
  text: string;
  nextNodeId?: string;
}

export default function WriteStoryPage() {
  const router = useRouter();

  const [currentNode, setCurrentNode] = useState<StoryNode>({
    id: "1",
    context: "",
    choices: [
      { id: "c1", text: "", nextNodeId: undefined },
      { id: "c2", text: "", nextNodeId: undefined },
    ],
    isEnd: false,
  });


  const [nodes, setNodes] = useState<StoryNode[]>([
    {
      id: "1",
      context: "",
      choices: [
        { id: "c1", text: "", nextNodeId: undefined },
        { id: "c2", text: "", nextNodeId: undefined },
      ],
      isEnd: false,
    },
  ]);

  const handleContextChange = (value: string) => {
    setCurrentNode({ ...currentNode, context: value });
  };

  const handleChoiceChange = (choiceId: string, value: string) => {
    const updatedChoices = currentNode.choices.map((choice) =>
      choice.id === choiceId ? { ...choice, text: value } : choice
    );
    setCurrentNode({ ...currentNode, choices: updatedChoices });
  };

  const handleDevelopChoice = (choiceId: string) => {
    // Créer un nouveau nœud pour ce choix
    const newNodeId = `${nodes.length + 1}`;
    const newNode: StoryNode = {
      id: newNodeId,
      context: "",
      choices: [
        { id: `c1-${newNodeId}`, text: "", nextNodeId: undefined },
        { id: `c2-${newNodeId}`, text: "", nextNodeId: undefined },
      ],
      isEnd: false,
    };

    // Mettre à jour le choix avec le lien vers le nouveau nœud
    const updatedChoices = currentNode.choices.map((choice) =>
      choice.id === choiceId ? { ...choice, nextNodeId: newNodeId } : choice
    );

    setCurrentNode({ ...currentNode, choices: updatedChoices });
    setNodes([...nodes, newNode]);
  };

  const handleSetAsEnd = () => {
    setCurrentNode({ ...currentNode, isEnd: true, choices: [] });
  };

  const handleSave = () => {
    // TODO: Enregistrer l'histoire via l'API
    console.log("Sauvegarde:", { nodes, currentNode });
    alert("Histoire sauvegardée !");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background animé Prism avec transition */}
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

      {/* Bouton retour */}
      <button
        type="button"
        onClick={() => router.push("/stories")}
        className="absolute top-6 left-6 z-20 group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-lg text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all duration-300 border border-white/10 hover:border-white/20"
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
      <div className="absolute top-6 right-6 z-20 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 w-64 h-48 overflow-hidden">
        <h3 className="text-white font-semibold text-sm mb-3">Arborescence</h3>
        <div className="relative h-full">
          {/* Visualisation simplifiée de l'arbre */}
          <div className="flex flex-col gap-2">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${
                  currentNode.id === node.id
                    ? "bg-purple-500/30 border border-purple-400/50"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => setCurrentNode(node)}
              >
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-white text-xs">Nœud {node.id}</span>
                {node.isEnd && (
                  <span className="ml-auto text-xs text-green-400">Fin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 min-h-screen pt-32 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 font-montserrat tracking-tight">
            Crée une histoire
          </h1>

          {/* Zone de contenu */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden mb-6">
            <div className="p-6">
              {/* Contexte */}
              <div className="mb-6">
                <label htmlFor="context" className="text-white font-semibold text-lg mb-3 block">
                  Contexte
                </label>
                <textarea
                  id="context"
                  value={currentNode.context}
                  onChange={(e) => handleContextChange(e.target.value)}
                  placeholder="Écrivez le contexte de cette partie de l'histoire..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/10 resize-none"
                />
              </div>

              {/* Choix */}
              {!currentNode.isEnd && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {currentNode.choices.map((choice, index) => (
                    <div
                      key={choice.id}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4"
                    >
                      <h3 className="text-white font-semibold mb-3">Choix {index + 1}</h3>
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
                        placeholder={`Texte du choix ${index + 1}...`}
                        className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all mb-3"
                      />
                      <button
                        type="button"
                        onClick={() => handleDevelopChoice(choice.id)}
                        className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm rounded-xl border border-purple-400/30 transition-all"
                      >
                        Développer le choix {index + 1}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4">
                {!currentNode.isEnd && (
                  <button
                    type="button"
                    onClick={handleSetAsEnd}
                    className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold rounded-2xl border border-green-400/30 transition-all"
                  >
                    Déterminer une fin
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 bg-white hover:bg-white/95 text-gray-900 font-bold py-3 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

