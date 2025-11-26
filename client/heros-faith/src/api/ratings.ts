import { apiClient } from './client';

export interface Rating {
  _id: string;
  user_id: string;
  story_id: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface StoryAverageRating {
  storyId: string;
  averageRating: number;
  totalRatings: number;
}

export interface CreateRatingRequest {
  user_id: string;
  story_id: string;
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
  getById: (ratingId: string): Promise<Rating> => {
    return apiClient.get<Rating>(`/ratings/${ratingId}`);
  },

  /**
   * Récupérer toutes les évaluations d'une histoire
   */
  getByStoryId: (storyId: string): Promise<Rating[]> => {
    return apiClient.get<Rating[]>(`/ratings/story/${storyId}`);
  },

  /**
   * Récupérer la note moyenne d'une histoire
   */
  getStoryAverage: (storyId: string): Promise<StoryAverageRating> => {
    return apiClient.get<StoryAverageRating>(`/ratings/story/${storyId}/average`);
  },

  /**
   * Récupérer l'évaluation d'un utilisateur pour une histoire
   */
  getUserRatingForStory: (userId: string, storyId: string): Promise<Rating> => {
    return apiClient.get<Rating>(`/ratings/user/${userId}/story/${storyId}`);
  },

  /**
   * Mettre à jour une évaluation
   */
  update: (ratingId: string, ratingData: UpdateRatingRequest): Promise<Rating> => {
    return apiClient.patch<Rating>(`/ratings/${ratingId}`, ratingData);
  },

  /**
   * Supprimer une évaluation
   */
  delete: (ratingId: string): Promise<void> => {
    return apiClient.delete<void>(`/ratings/${ratingId}`);
  },
};

