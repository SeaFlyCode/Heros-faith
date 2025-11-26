import { apiClient } from './client';

export interface Noeud {
  id: number;
  storyId: number;
  title: string;
  content?: string;
  isStart?: boolean;
  isEnd?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoeudRequest {
  storyId: number;
  title: string;
  content?: string;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface UpdateNoeudRequest {
  title?: string;
  content?: string;
  isStart?: boolean;
  isEnd?: boolean;
}

/**
 * API pour la gestion des noeuds (points de l'histoire)
 */
export const noeudsApi = {
  /**
   * Créer un nouveau noeud (creator uniquement)
   */
  create: (noeudData: CreateNoeudRequest): Promise<Noeud> => {
    return apiClient.post<Noeud>('/noeuds', noeudData);
  },

  /**
   * Récupérer tous les noeuds
   */
  getAll: (): Promise<Noeud[]> => {
    return apiClient.get<Noeud[]>('/noeuds');
  },

  /**
   * Récupérer un noeud par son ID
   */
  getById: (noeudId: number): Promise<Noeud> => {
    return apiClient.get<Noeud>(`/noeuds/${noeudId}`);
  },

  /**
   * Mettre à jour un noeud (creator uniquement)
   */
  update: (noeudId: number, noeudData: UpdateNoeudRequest): Promise<Noeud> => {
    return apiClient.patch<Noeud>(`/noeuds/${noeudId}`, noeudData);
  },

  /**
   * Supprimer un noeud (creator uniquement)
   */
  delete: (noeudId: number): Promise<void> => {
    return apiClient.delete<void>(`/noeuds/${noeudId}`);
  },
};

