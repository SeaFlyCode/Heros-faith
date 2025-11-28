/**
 * Système de logging conditionnel pour améliorer les performances
 * Les logs ne s'affichent que si DEBUG_MODE est activé
 */

// Activer/désactiver les logs (mettre à false en production)
const DEBUG_MODE = false; // Changez à true seulement pour débugger

export const logger = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Toujours afficher les erreurs
    console.error(...args);
  },

  info: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.info(...args);
    }
  },
};

