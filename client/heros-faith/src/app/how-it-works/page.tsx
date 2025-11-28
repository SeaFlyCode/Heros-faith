"use client";

import PrismTransition from "@/components/PrismTransition";
import { useState } from "react";

// Étape du tutoriel
interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const readerSteps: Step[] = [
  {
    number: 1,
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement pour commencer à lire des histoires interactives captivantes.",
    icon: "user",
  },
  {
    number: 2,
    title: "Explorez les histoires",
    description: "Parcourez notre bibliothèque d'histoires interactives créées par la communauté. Choisissez votre aventure !",
    icon: "book",
  },
  {
    number: 3,
    title: "Faites vos choix",
    description: "À chaque étape, prenez des décisions qui influencent le cours de l'histoire. Vos choix comptent !",
    icon: "path",
  },
  {
    number: 4,
    title: "Découvrez les fins",
    description: "Explorez toutes les fins possibles et rejouez pour découvrir tous les chemins narratifs.",
    icon: "star",
  },
];

const writerSteps: Step[] = [
  {
    number: 1,
    title: "Créez votre histoire",
    description: "Définissez le titre, le genre et la description de votre récit interactif.",
    icon: "write",
  },
  {
    number: 2,
    title: "Écrivez les pages",
    description: "Rédigez chaque page de votre histoire avec du contenu narratif captivant.",
    icon: "book",
  },
  {
    number: 3,
    title: "Créez les embranchements",
    description: "Ajoutez des choix qui mènent vers différentes pages et créez des nœuds narratifs complexes.",
    icon: "path",
  },
  {
    number: 4,
    title: "Publiez et partagez",
    description: "Une fois terminée, publiez votre histoire pour que la communauté puisse la découvrir et l'apprécier !",
    icon: "share",
  },
];

const StepCard = ({ step, index, totalSteps }: { step: Step; index: number; totalSteps: number }) => {
  const icons = {
    user: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    book: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    path: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    write: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    star: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    share: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  };

  return (
    <div className="group relative">
      {/* Ligne de connexion vers la prochaine étape (sauf pour la dernière) */}
      {index < totalSteps - 1 && (
        <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent -translate-y-1/2 z-0" />
      )}

      {/* Carte */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 z-10">
        {/* Numéro */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20">
          {step.number}
        </div>

        {/* Icône */}
        <div className="mb-6 text-cyan-400 group-hover:text-cyan-300 transition-colors">
          {icons[step.icon as keyof typeof icons]}
        </div>

        {/* Contenu */}
        <h3 className="text-white text-2xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
          {step.title}
        </h3>
        <p className="text-white/70 leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => {
  const icons = {
    branch: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    community: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    save: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    infinite: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300">
      <div className="text-cyan-400 mb-4">
        {icons[icon as keyof typeof icons]}
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
};

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"reader" | "writer">("reader");
  const steps = activeTab === "reader" ? readerSteps : writerSteps;

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background animé Prism */}
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
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white font-montserrat tracking-tight mb-6">
            Comment ça marche ?
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Découvrez comment créer et vivre des aventures interactives uniques où chaque choix compte.
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-12">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab("reader")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "reader"
                  ? "bg-cyan-500/30 text-white border border-cyan-400/50 shadow-lg shadow-cyan-500/30"
                  : "bg-cyan-500/10 text-white/70 border border-cyan-400/20 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400/30"
              }`}
            >
              Pour les lecteurs
            </button>
            <button
              onClick={() => setActiveTab("writer")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "writer"
                  ? "bg-cyan-500/30 text-white border border-cyan-400/50 shadow-lg shadow-cyan-500/30"
                  : "bg-cyan-500/10 text-white/70 border border-cyan-400/20 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400/30"
              }`}
            >
              Pour les auteurs
            </button>
          </div>
        </div>

        {/* Étapes */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} totalSteps={steps.length} />
            ))}
          </div>
        </div>

        {/* Fonctionnalités clés */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Pourquoi Hero&apos;s Faith ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="branch"
              title="Histoires ramifiées"
              description="Chaque décision crée une nouvelle branche narrative, offrant une expérience unique à chaque lecture."
            />
            <FeatureCard
              icon="community"
              title="Communauté créative"
              description="Rejoignez une communauté d'auteurs et de lecteurs passionnés par les récits interactifs."
            />
            <FeatureCard
              icon="save"
              title="Progression sauvegardée"
              description="Reprenez vos histoires là où vous les aviez laissées. Vos choix sont toujours mémorisés."
            />
            <FeatureCard
              icon="infinite"
              title="Possibilités infinies"
              description="Créez des histoires avec autant de branches et de fins différentes que vous le souhaitez."
            />
          </div>
        </div>

        {/* Section exemple de lecture */}
        {activeTab === "reader" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 mb-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300">
              <h2 className="text-3xl font-bold text-white mb-6">
                Exemple de lecture interactive
              </h2>
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-white/90 mb-6 leading-relaxed">
                    Vous vous trouvez devant une porte mystérieuse dans une forêt sombre.
                    Des bruits étranges proviennent de l&apos;autre côté. Que faites-vous ?
                  </p>
                  <div className="space-y-3">
                    <button className="w-full px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-white text-left transition-all duration-300 hover:translate-x-2">
                      → Ouvrir la porte avec précaution
                    </button>
                    <button className="w-full px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-white text-left transition-all duration-300 hover:translate-x-2">
                      → Faire demi-tour et explorer ailleurs
                    </button>
                    <button className="w-full px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-white text-left transition-all duration-300 hover:translate-x-2">
                      → Écouter attentivement avant de décider
                    </button>
                  </div>
                </div>
                <p className="text-white/60 text-center text-sm">
                  Chaque choix vous mène vers une histoire différente !
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section création pour auteurs */}
        {activeTab === "writer" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 mb-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300">
              <h2 className="text-3xl font-bold text-white mb-6">
                Créez votre propre aventure
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Créez votre histoire</h3>
                    <p className="text-white/70">Définissez le titre, le genre et la description de votre récit.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Écrivez les pages</h3>
                    <p className="text-white/70">Rédigez chaque page de votre histoire avec le contenu narratif.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Créez les embranchements</h3>
                    <p className="text-white/70">Ajoutez des choix qui mènent vers différentes pages et créez des nœuds narratifs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Publiez et partagez</h3>
                    <p className="text-white/70">Une fois terminée, publiez votre histoire pour que la communauté puisse la découvrir !</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Rejoignez Hero&apos;s Faith dès aujourd&apos;hui et découvrez un monde d&apos;histoires infinies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="px-8 py-4 bg-cyan-500/30 hover:bg-cyan-500/40 text-white font-semibold rounded-full border border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
              >
                Créer un compte
              </a>
              <a
                href="/read"
                className="px-8 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-white font-semibold rounded-full border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
              >
                Explorer les histoires
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

