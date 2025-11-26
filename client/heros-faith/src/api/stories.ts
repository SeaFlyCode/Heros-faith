import { apiClient } from './client';

export interface Story {
  _id: string;
  title: string;
  description?: string;
  author: string;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoryRequest {
  title: string;
  description?: string;
  status?: 'draft' | 'published';
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
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
  getById: (storyId: string): Promise<Story> => {
    return apiClient.get<Story>(`/stories/${storyId}`);
  },

  /**
   * Mettre à jour une histoire
   */
  update: (storyId: string, storyData: UpdateStoryRequest): Promise<Story> => {
    return apiClient.patch<Story>(`/stories/${storyId}`, storyData);
  },

  /**
   * Supprimer une histoire
   */
  delete: (storyId: string): Promise<void> => {
    return apiClient.delete<void>(`/stories/${storyId}`);
  },
};

