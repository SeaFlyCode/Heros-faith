import { apiClient } from './client';

export interface Page {
  id: number;
  partyId: number;
  noeudId: number;
  visitedAt?: string;
  createdAt?: string;
}

export interface CreatePageRequest {
  partyId: number;
  noeudId: number;
}

export interface UpdatePageRequest {
  partyId?: number;
  noeudId?: number;
}

/**
 * API pour la gestion des pages (historique de navigation)
 */
export const pagesApi = {
  /**
   * Créer une nouvelle page
   */
  create: (pageData: CreatePageRequest): Promise<Page> => {
    return apiClient.post<Page>('/pages', pageData);
  },

  /**
   * Récupérer toutes les pages
   */
  getAll: (): Promise<Page[]> => {
    return apiClient.get<Page[]>('/pages');
  },

  /**
   * Récupérer une page par son ID
   */
  getById: (pageId: number): Promise<Page> => {
    return apiClient.get<Page>(`/pages/${pageId}`);
  },

  /**
   * Mettre à jour une page
   */
  update: (pageId: number, pageData: UpdatePageRequest): Promise<Page> => {
    return apiClient.patch<Page>(`/pages/${pageId}`, pageData);
  },

  /**
   * Supprimer une page (admin uniquement)
   */
  delete: (pageId: number): Promise<void> => {
    return apiClient.delete<void>(`/pages/${pageId}`);
  },
};

