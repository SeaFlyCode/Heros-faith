import { apiClient } from './client';

export interface Party {
  _id: string;
  user_id: string;
  story_id: string;
  start_date: string;
  end_date?: string;
  path: string[]; // Array of page IDs
  ending_id?: string;
}

export interface PartyProgress {
  partyId: string;
  storyId: string;
  visitedPages: number;
  totalPages: number;
  progress: number; // Percentage 0-100
  isCompleted: boolean;
}

export interface CreatePartyRequest {
  user_id: string;
  story_id: string;
  path?: string[];
}

export interface UpdatePartyRequest {
  path?: string[];
  end_date?: string;
  ending_id?: string;
}

/**
 * API pour la gestion des parties (sessions de lecture)
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
  getById: (partyId: string): Promise<Party> => {
    return apiClient.get<Party>(`/parties/${partyId}`);
  },

  /**
   * Récupérer toutes les parties d'un utilisateur
   */
  getByUserId: (userId: string): Promise<Party[]> => {
    return apiClient.get<Party[]>(`/parties/user/${userId}`);
  },

  /**
   * Récupérer la partie d'un utilisateur pour une histoire spécifique
   */
  getByUserAndStory: (userId: string, storyId: string): Promise<Party> => {
    return apiClient.get<Party>(`/parties/user/${userId}/story/${storyId}`);
  },

  /**
   * Récupérer la progression d'une partie
   */
  getProgress: (partyId: string): Promise<PartyProgress> => {
    return apiClient.get<PartyProgress>(`/parties/${partyId}/progress`);
  },

  /**
   * Mettre à jour une partie
   */
  update: (partyId: string, partyData: UpdatePartyRequest): Promise<Party> => {
    return apiClient.patch<Party>(`/parties/${partyId}`, partyData);
  },

  /**
   * Supprimer une partie
   */
  delete: (partyId: string): Promise<void> => {
    return apiClient.delete<void>(`/parties/${partyId}`);
  },
};

