import { useEffect, useState } from 'react';
import {
  getBrowserSupport,
  getRecommendedQuality,
  getOptimalAnimationSettings,
  prefersReducedMotion,
  type BrowserSupport,
} from '@/utils/browserSupport';

/**
 * Hook pour détecter le support des fonctionnalités navigateur
 * et adapter l'expérience utilisateur
 */
export const useBrowserSupport = () => {
  const [support, setSupport] = useState<BrowserSupport>({
    webgl: false,
    backdropFilter: false,
    svgFilters: false,
    isLowPerformance: false,
    isMobile: false,
  });

  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [animationSettings, setAnimationSettings] = useState({
    enableBlur: true,
    enableTransitions: true,
    enablePrism: true,
    enableGlass: true,
    reducedMotion: false,
  });

  useEffect(() => {
    // Détecter le support uniquement côté client
    const browserSupport = getBrowserSupport();
    const recommendedQuality = getRecommendedQuality();
    const optimalSettings = getOptimalAnimationSettings();
    const reducedMotion = prefersReducedMotion();

    setSupport(browserSupport);
    setQuality(recommendedQuality);
    setAnimationSettings({
      ...optimalSettings,
      reducedMotion: reducedMotion || optimalSettings.reducedMotion,
    });

    // Écouter les changements de préférence de mouvement réduit
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setAnimationSettings((prev) => ({
        ...prev,
        reducedMotion: e.matches,
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    support,
    quality,
    animationSettings,
  };
};

/**
 * Hook pour obtenir le mode de performance adaptatif
 */
export const useAdaptivePerformance = () => {
  const { quality, animationSettings } = useBrowserSupport();
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'low' | 'high'>('auto');

  useEffect(() => {
    // Auto-détecter le mode de performance au chargement
    if (quality === 'low') {
      setPerformanceMode('low');
    } else {
      setPerformanceMode('high');
    }
  }, [quality]);

  // Permettre le changement manuel du mode
  const setMode = (mode: 'auto' | 'low' | 'high') => {
    setPerformanceMode(mode);
  };

  return {
    mode: performanceMode,
    setMode,
    isLowPerformanceMode: performanceMode === 'low',
    animationSettings,
  };
};

