import { apiClient } from './client';

export interface Choice {
  _id: string;
  page_id: string;
  text: string;
  target_page_id: string;
  condition?: string;
}

export interface CreateChoiceRequest {
  page_id: string;
  text: string;
  target_page_id: string;
  condition?: string;
}

export interface UpdateChoiceRequest {
  text?: string;
  target_page_id?: string;
  condition?: string;
}

/**
 * API pour la gestion des choix (liens entre pages)
 */
export const choicesApi = {
  /**
   * Créer un nouveau choix
   */
  create: (choiceData: CreateChoiceRequest): Promise<Choice> => {
    return apiClient.post<Choice>('/choices', choiceData);
  },

  /**
   * Récupérer tous les choix
   */
  getAll: (): Promise<Choice[]> => {
    return apiClient.get<Choice[]>('/choices');
  },

  /**
   * Récupérer un choix par son ID
   */
  getById: (choiceId: string): Promise<Choice> => {
    return apiClient.get<Choice>(`/choices/${choiceId}`);
  },

  /**
   * Récupérer tous les choix d'une page
   */
  getByPageId: (pageId: string): Promise<Choice[]> => {
    return apiClient.get<Choice[]>(`/pages/${pageId}/choices`);
  },

  /**
   * Mettre à jour un choix
   */
  update: (choiceId: string, choiceData: UpdateChoiceRequest): Promise<Choice> => {
    return apiClient.patch<Choice>(`/choices/${choiceId}`, choiceData);
  },

  /**
   * Supprimer un choix
   */
  delete: (choiceId: string): Promise<void> => {
    return apiClient.delete<void>(`/choices/${choiceId}`);
  },
};

