import { apiClient } from './client';

export interface StoryPage {
  _id: string;
  story_id: string;
  content: string;
  is_ending: boolean;
  ending_label?: string;
  illustration?: string;
}

export interface CreateStoryPageRequest {
  story_id: string;
  content?: string;
  is_ending?: boolean;
  ending_label?: string;
  illustration?: string;
}

export interface UpdateStoryPageRequest {
  content?: string;
  is_ending?: boolean;
  ending_label?: string;
  illustration?: string;
}

/**
 * API pour la gestion des pages narratives (nœuds de l'histoire)
 */
export const storyPagesApi = {
  /**
   * Créer une nouvelle page narrative
   */
  create: (pageData: CreateStoryPageRequest): Promise<StoryPage> => {
    return apiClient.post<StoryPage>('/pages', pageData);
  },

  /**
   * Récupérer toutes les pages narratives
   */
  getAll: (): Promise<StoryPage[]> => {
    return apiClient.get<StoryPage[]>('/pages');
  },

  /**
   * Récupérer une page narrative par son ID
   */
  getById: (pageId: string): Promise<StoryPage> => {
    return apiClient.get<StoryPage>(`/pages/${pageId}`);
  },

  /**
   * Récupérer toutes les pages d'une histoire
   */
  getByStoryId: (storyId: string): Promise<StoryPage[]> => {
    return apiClient.get<StoryPage[]>(`/stories/${storyId}/pages`);
  },

  /**
   * Mettre à jour une page narrative
   */
  update: (pageId: string, pageData: UpdateStoryPageRequest): Promise<StoryPage> => {
    return apiClient.patch<StoryPage>(`/pages/${pageId}`, pageData);
  },

  /**
   * Supprimer une page narrative
   */
  delete: (pageId: string): Promise<void> => {
    return apiClient.delete<void>(`/pages/${pageId}`);
  },
};

