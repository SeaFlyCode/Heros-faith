import { apiClient } from './client';

export interface Choice {
  id: number;
  noeudId: number;
  text: string;
  targetNoeudId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChoiceRequest {
  noeudId: number;
  text: string;
  targetNoeudId: number;
}

export interface UpdateChoiceRequest {
  text?: string;
  targetNoeudId?: number;
}

/**
 * API pour la gestion des choix (liens entre noeuds)
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
  getById: (choiceId: number): Promise<Choice> => {
    return apiClient.get<Choice>(`/choices/${choiceId}`);
  },

  /**
   * Mettre à jour un choix
   */
  update: (choiceId: number, choiceData: UpdateChoiceRequest): Promise<Choice> => {
    return apiClient.patch<Choice>(`/choices/${choiceId}`, choiceData);
  },

  /**
   * Supprimer un choix (admin uniquement)
   */
  delete: (choiceId: number): Promise<void> => {
    return apiClient.delete<void>(`/choices/${choiceId}`);
  },
};

