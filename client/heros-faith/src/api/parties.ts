import { apiClient } from './client';

export interface Party {
  id: number;
  userId: number;
  storyId: number;
  currentNoeudId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePartyRequest {
  storyId: number;
  currentNoeudId?: number;
}

export interface UpdatePartyRequest {
  currentNoeudId?: number;
  storyId?: number;
}

/**
 * API pour la gestion des parties (sessions de jeu)
 */
export const partiesApi = {
  /**
   * Créer une nouvelle partie
   */
  create: (partyData: CreatePartyRequest): Promise<Party> => {
    return apiClient.post<Party>('/parties', partyData);
  },

  /**
   * Récupérer toutes les parties
   */
  getAll: (): Promise<Party[]> => {
    return apiClient.get<Party[]>('/parties');
  },

  /**
   * Récupérer une partie par son ID
   */
  getById: (partyId: number): Promise<Party> => {
    return apiClient.get<Party>(`/parties/${partyId}`);
  },

  /**
   * Mettre à jour une partie
   */
  update: (partyId: number, partyData: UpdatePartyRequest): Promise<Party> => {
    return apiClient.patch<Party>(`/parties/${partyId}`, partyData);
  },

  /**
   * Supprimer une partie
   */
  delete: (partyId: number): Promise<void> => {
    return apiClient.delete<void>(`/parties/${partyId}`);
  },
};

