import { apiClient } from './client';

export interface StoryChoice {
  _id: string;
  page_id: string;
  text: string;
  target_page_id: string;
  condition?: string;
}

export interface CreateStoryChoiceRequest {
  page_id: string;
  text: string;
  target_page_id: string;
  condition?: string;
}

export interface UpdateStoryChoiceRequest {
  text?: string;
  target_page_id?: string;
  condition?: string;
}

/**
 * API pour la gestion des choix (liens entre pages narratives)
 */
export const storyChoicesApi = {
  /**
   * Créer un nouveau choix
   */
  create: (choiceData: CreateStoryChoiceRequest): Promise<StoryChoice> => {
    return apiClient.post<StoryChoice>('/choices', choiceData);
  },

  /**
   * Récupérer tous les choix
   */
  getAll: (): Promise<StoryChoice[]> => {
    return apiClient.get<StoryChoice[]>('/choices');
  },

  /**
   * Récupérer un choix par son ID
   */
  getById: (choiceId: string): Promise<StoryChoice> => {
    return apiClient.get<StoryChoice>(`/choices/${choiceId}`);
  },

  /**
   * Récupérer tous les choix d'une page
   */
  getByPageId: (pageId: string): Promise<StoryChoice[]> => {
    return apiClient.get<StoryChoice[]>(`/pages/${pageId}/choices`);
  },

  /**
   * Mettre à jour un choix
   */
  update: (choiceId: string, choiceData: UpdateStoryChoiceRequest): Promise<StoryChoice> => {
    return apiClient.patch<StoryChoice>(`/choices/${choiceId}`, choiceData);
  },

  /**
   * Supprimer un choix
   */
  delete: (choiceId: string): Promise<void> => {
    return apiClient.delete<void>(`/choices/${choiceId}`);
  },
};

