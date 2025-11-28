"use client";

import { useEffect, useState } from 'react';
import { useBrowserSupport } from '@/hooks/useBrowserSupport';

/**
 * Composant pour afficher une notification si le navigateur
 * ne supporte pas certaines fonctionnalités
 */
export default function BrowserSupportNotification() {
  const { support, quality } = useBrowserSupport();
  const [showNotification, setShowNotification] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la notification
    const hasDissmissed = localStorage.getItem('browser-support-notification-dismissed');

    if (hasDissmissed) {
      setDismissed(true);
      return;
    }

    // Afficher la notification si le support est limité
    if (quality === 'low' || !support.webgl || !support.backdropFilter) {
      // Attendre 2 secondes avant d'afficher pour ne pas perturber l'expérience
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [support, quality]);

  const handleDismiss = () => {
    setShowNotification(false);
    setDismissed(true);
    localStorage.setItem('browser-support-notification-dismissed', 'true');
  };

  if (!showNotification || dismissed) {
    return null;
  }

  const getMessage = () => {
    if (!support.webgl) {
      return {
        title: 'Effets visuels désactivés',
        description:
          'Votre navigateur ne supporte pas WebGL. Certains effets visuels sont désactivés pour une meilleure expérience.',
        suggestion: 'Essayez Chrome, Firefox ou Edge pour une expérience complète.',
      };
    }

    if (!support.backdropFilter && !support.svgFilters) {
      return {
        title: 'Effets de verre simplifiés',
        description:
          'Votre navigateur a un support limité pour les effets de flou. Une version simplifiée est affichée.',
        suggestion: 'Mettez à jour votre navigateur pour une expérience optimale.',
      };
    }

    if (support.isLowPerformance) {
      return {
        title: 'Mode performance activé',
        description:
          'Pour améliorer les performances sur votre appareil, certains effets visuels sont réduits.',
        suggestion: null,
      };
    }

    return {
      title: 'Navigation optimisée',
      description: 'L\'expérience a été adaptée pour votre navigateur.',
      suggestion: null,
    };
  };

  const message = getMessage();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          {/* Icône */}
          <div className="flex-shrink-0 w-6 h-6 text-yellow-500 dark:text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {message.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {message.description}
            </p>
            {message.suggestion && (
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                💡 {message.suggestion}
              </p>
            )}
          </div>

          {/* Bouton fermer */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Afficher les détails techniques (en dev mode) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Détails techniques
            </summary>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>WebGL: {support.webgl ? '✅' : '❌'}</p>
              <p>Backdrop Filter: {support.backdropFilter ? '✅' : '❌'}</p>
              <p>SVG Filters: {support.svgFilters ? '✅' : '❌'}</p>
              <p>Mobile: {support.isMobile ? 'Oui' : 'Non'}</p>
              <p>Performance: {quality}</p>
              {support.hardwareConcurrency && (
                <p>CPU Cores: {support.hardwareConcurrency}</p>
              )}
              {support.deviceMemory && <p>Memory: {support.deviceMemory} GB</p>}
            </div>
          </details>
        )}
      </div>


    </div>
  );
}

