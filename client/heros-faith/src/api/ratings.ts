import { apiClient } from './client';

export interface Rating {
  id: number;
  userId: number;
  storyId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRatingRequest {
  storyId: number;
  rating: number;
  comment?: string;
}

export interface UpdateRatingRequest {
  rating?: number;
  comment?: string;
}

/**
 * API pour la gestion des évaluations
 */
export const ratingsApi = {
  /**
   * Créer une nouvelle évaluation
   */
  create: (ratingData: CreateRatingRequest): Promise<Rating> => {
    return apiClient.post<Rating>('/ratings', ratingData);
  },

  /**
   * Récupérer toutes les évaluations
   */
  getAll: (): Promise<Rating[]> => {
    return apiClient.get<Rating[]>('/ratings');
  },

  /**
   * Récupérer une évaluation par son ID
   */
  getById: (ratingId: number): Promise<Rating> => {
    return apiClient.get<Rating>(`/ratings/${ratingId}`);
  },

  /**
   * Mettre à jour une évaluation
   */
  update: (ratingId: number, ratingData: UpdateRatingRequest): Promise<Rating> => {
    return apiClient.patch<Rating>(`/ratings/${ratingId}`, ratingData);
  },

  /**
   * Supprimer une évaluation
   */
  delete: (ratingId: number): Promise<void> => {
    return apiClient.delete<void>(`/ratings/${ratingId}`);
  },
};

