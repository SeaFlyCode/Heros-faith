import { apiClient } from './client';

export interface Story {
  id: number;
  title: string;
  description?: string;
  authorId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoryRequest {
  title: string;
  description?: string;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
}

/**
 * API pour la gestion des histoires
 */
export const storiesApi = {
  /**
   * Créer une nouvelle histoire
   */
  create: (storyData: CreateStoryRequest): Promise<Story> => {
    return apiClient.post<Story>('/stories', storyData);
  },

  /**
   * Récupérer toutes les histoires
   */
  getAll: (): Promise<Story[]> => {
    return apiClient.get<Story[]>('/stories');
  },

  /**
   * Récupérer une histoire par son ID
   */
  getById: (storyId: number): Promise<Story> => {
    return apiClient.get<Story>(`/stories/${storyId}`);
  },

  /**
   * Mettre à jour une histoire (admin uniquement)
   */
  update: (storyId: number, storyData: UpdateStoryRequest): Promise<Story> => {
    return apiClient.patch<Story>(`/stories/${storyId}`, storyData);
  },

  /**
   * Supprimer une histoire (admin uniquement)
   */
  delete: (storyId: number): Promise<void> => {
    return apiClient.delete<void>(`/stories/${storyId}`);
  },
};

