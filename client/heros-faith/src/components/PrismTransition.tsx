"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Prism from "./Prism";

/**
 * PrismTransition - Composant wrapper pour le Prism avec gestion intelligente des transitions
 *
 * Gère les transitions fluides du prisme lors de la navigation :
 * - Home → Autre page : Effet de dézoom (2.5 → 2)
 * - Autre page → Home : Effet de zoom intérieur (2 → 2.5)
 * - Entre pages non-home : Pas de transition (instantané)
 */
interface PrismTransitionProps {
  animationType?: "rotate" | "hover" | "3drotate";
  timeScale?: number;
  height?: number;
  baseWidth?: number;
  targetScale?: number;
  hueShift?: number;
  colorFrequency?: number;
  noise?: number;
  glow?: number;
  offset?: { x?: number; y?: number };
}

export default function PrismTransition({
  animationType = "rotate",
  timeScale = 0.5,
  height = 2,
  baseWidth = 3,
  targetScale = 2,
  hueShift = 0,
  colorFrequency = 1,
  noise = 0.08,
  glow = 0.8,
  offset = { x: 0, y: 0 },
}: PrismTransitionProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Valeurs du prisme selon le type de page
  // Home: scale 2.5, height 3.5, baseWidth 5.5 (grand prisme)
  // Autres pages: scale 2, height 2, baseWidth 3 (prisme réduit)
  const finalScale = isHomePage ? 2.5 : targetScale;
  const finalHeight = isHomePage ? 3.5 : height;
  const finalBaseWidth = isHomePage ? 5.5 : baseWidth;

  // États pour gérer les valeurs animées du prisme
  const [currentScale, setCurrentScale] = useState(finalScale);
  const [currentHeight, setCurrentHeight] = useState(finalHeight);
  const [currentBaseWidth, setCurrentBaseWidth] = useState(finalBaseWidth);
  
  // Mémorisation du chemin précédent pour détecter le type de navigation
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    const wasHomePage = previousPath === "/";
    const isNowHomePage = pathname === "/";

    // ============================================================
    // CAS 1: Navigation Home → Autre page (effet de dézoom 🔽)
    // ============================================================
    if (wasHomePage && !isNowHomePage) {
      // Étape 1: Définir les valeurs initiales (grand prisme de la home)
      setCurrentScale(2.5);
      setCurrentHeight(3.5);
      setCurrentBaseWidth(5.5);

      // Étape 2: Utiliser requestAnimationFrame imbriqués pour forcer un reflow
      // Cela permet à la transition CSS de se déclencher correctement
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Animer vers les petites valeurs (prisme réduit)
          setCurrentScale(targetScale);
          setCurrentHeight(height);
          setCurrentBaseWidth(baseWidth);
        });
      });

      setPreviousPath(pathname);
    }

    // ============================================================
    // CAS 2: Navigation Autre page → Home (effet de zoom intérieur 🔼)
    // ============================================================
    else if (!wasHomePage && isNowHomePage) {
      // Étape 1: Définir les valeurs initiales (petit prisme)
      setCurrentScale(targetScale);
      setCurrentHeight(height);
      setCurrentBaseWidth(baseWidth);

      // Étape 2: Forcer un reflow avec requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Animer vers les grandes valeurs (prisme de la home)
          setCurrentScale(2.5);
          setCurrentHeight(3.5);
          setCurrentBaseWidth(5.5);
        });
      });

      setPreviousPath(pathname);
    }

    // ============================================================
    // CAS 3: Navigation entre pages non-home (pas de transition ⚡)
    // ============================================================
    else if (!wasHomePage && !isNowHomePage) {
      // Changement instantané sans animation
      setCurrentScale(finalScale);
      setCurrentHeight(finalHeight);
      setCurrentBaseWidth(finalBaseWidth);
      setPreviousPath(pathname);
    }

    // ============================================================
    // CAS 4: Premier chargement ou refresh de page (direct 🎯)
    // ============================================================
    else {
      // Affichage direct à la bonne taille, pas d'animation
      setCurrentScale(finalScale);
      setCurrentHeight(finalHeight);
      setCurrentBaseWidth(finalBaseWidth);
      setPreviousPath(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      className="absolute inset-0 w-full h-full z-0 pointer-events-none transition-all duration-1000 ease-out"
      style={{
        // Transform scale normalisé par rapport à la référence 2.5
        // Cela permet des transitions fluides entre différentes tailles
        transform: `scale(${currentScale / 2.5})`,
        transformOrigin: "center center",
      }}
    >
      {/* Composant Prism avec scale de référence fixe à 2.5 */}
      <Prism
        animationType={animationType}
        timeScale={timeScale}
        height={currentHeight}
        baseWidth={currentBaseWidth}
        scale={2.5} // Scale de référence fixe, le scaling réel est géré par le transform CSS
        hueShift={hueShift}
        colorFrequency={colorFrequency}
        noise={noise}
        glow={glow}
        offset={offset}
      />
      
      {/* Overlay sombre pour améliorer le contraste avec le contenu */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />
    </div>
  );
}

