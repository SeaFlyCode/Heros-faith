/**
 * Helper pour construire les URLs d'images de manière cohérente
 */

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * Construit l'URL complète pour une image
 * @param imagePath - Chemin de l'image (ex: "/api/uploads/image.png" ou "profile.png")
 * @returns URL complète de l'image
 */
export function getImageUrl(imagePath: string | undefined | null): string | null {
  if (!imagePath) return null;

  // Si le chemin commence déjà par http:// ou https://, le retourner tel quel
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si le chemin commence par /api/uploads ou /uploads, concaténer avec le serveur
  if (imagePath.startsWith('/api/uploads') || imagePath.startsWith('/uploads')) {
    return `${SERVER_BASE_URL}${imagePath}`;
  }

  // Sinon, ajouter /api/uploads/ avant le nom du fichier
  return `${SERVER_BASE_URL}/api/uploads/${imagePath}`;
}

/**
 * Construit l'URL pour une photo de profil
 * @param filename - Nom du fichier (ex: "profile-123456.png")
 * @returns URL complète de la photo de profil
 */
export function getProfileImageUrl(filename: string | undefined | null): string | null {
  return getImageUrl(filename);
}

/**
 * Construit l'URL pour une image de couverture d'histoire
 * @param filename - Nom du fichier ou chemin complet
 * @returns URL complète de l'image de couverture
 */
export function getCoverImageUrl(filename: string | undefined | null): string | null {
  return getImageUrl(filename);
}

