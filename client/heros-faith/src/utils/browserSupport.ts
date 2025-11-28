/**
 * Utilitaires pour détecter le support des fonctionnalités navigateur
 * et adapter l'expérience utilisateur en conséquence
 */

export interface BrowserSupport {
  webgl: boolean;
  backdropFilter: boolean;
  svgFilters: boolean;
  isLowPerformance: boolean;
  isMobile: boolean;
  connectionType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

/**
 * Détecte le support WebGL
 */
export const supportsWebGL = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return false;

    // Vérifier si WebGL fonctionne vraiment
    const glContext = gl as WebGLRenderingContext;
    return glContext.getParameter(glContext.VERSION) !== null;
  } catch (e) {
    return false;
  }
};

/**
 * Détecte le support backdrop-filter
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    return (
      CSS.supports('backdrop-filter', 'blur(10px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
    );
  } catch (e) {
    return false;
  }
};

/**
 * Détecte le support des filtres SVG
 */
export const supportsSVGFilters = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  try {
    // Safari et Firefox ont des problèmes avec les filtres SVG dans backdrop-filter
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) return false;

    const div = document.createElement('div');
    div.style.backdropFilter = 'url(#test)';
    return div.style.backdropFilter !== '';
  } catch (e) {
    return false;
  }
};

/**
 * Détecte si l'appareil a de faibles performances
 */
export const detectLowPerformance = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    // Détecter les appareils mobiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Détecter les connexions lentes
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const slowConnection =
      connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

    // Détecter le nombre de cœurs processeur (< 4 = faible)
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    // Détecter la mémoire disponible (< 4GB = faible)
    const deviceMemory = (navigator as any).deviceMemory;
    const lowMemory = deviceMemory && deviceMemory < 4;

    return isMobile || slowConnection || lowCores || lowMemory || false;
  } catch (e) {
    return false;
  }
};

/**
 * Détecte si l'appareil est mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Récupère toutes les informations de support
 */
export const getBrowserSupport = (): BrowserSupport => {
  if (typeof window === 'undefined') {
    return {
      webgl: false,
      backdropFilter: false,
      svgFilters: false,
      isLowPerformance: false,
      isMobile: false,
    };
  }

  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  return {
    webgl: supportsWebGL(),
    backdropFilter: supportsBackdropFilter(),
    svgFilters: supportsSVGFilters(),
    isLowPerformance: detectLowPerformance(),
    isMobile: isMobileDevice(),
    connectionType: connection?.effectiveType,
    deviceMemory: (navigator as any).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
  };
};

/**
 * Obtient le niveau de qualité recommandé pour les effets visuels
 */
export const getRecommendedQuality = (): 'low' | 'medium' | 'high' => {
  const support = getBrowserSupport();

  if (support.isLowPerformance || !support.webgl) {
    return 'low';
  }

  if (!support.backdropFilter || !support.svgFilters) {
    return 'medium';
  }

  return 'high';
};

/**
 * Obtient le DPR optimal selon les performances
 */
export const getOptimalDPR = (): number => {
  if (typeof window === 'undefined') return 1;

  const support = getBrowserSupport();
  const deviceDPR = window.devicePixelRatio || 1;

  if (support.isLowPerformance) {
    return 1;
  }

  return Math.min(2, deviceDPR);
};

/**
 * Obtient les paramètres d'animation optimaux
 */
export const getOptimalAnimationSettings = () => {
  const quality = getRecommendedQuality();

  switch (quality) {
    case 'low':
      return {
        enableBlur: false,
        enableTransitions: false,
        enablePrism: false,
        enableGlass: false,
        reducedMotion: true,
      };

    case 'medium':
      return {
        enableBlur: true,
        enableTransitions: true,
        enablePrism: true,
        enableGlass: true,
        reducedMotion: false,
      };

    case 'high':
    default:
      return {
        enableBlur: true,
        enableTransitions: true,
        enablePrism: true,
        enableGlass: true,
        reducedMotion: false,
      };
  }
};

/**
 * Vérifie si l'utilisateur préfère réduire les mouvements
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

