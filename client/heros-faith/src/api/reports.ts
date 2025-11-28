import { apiClient } from './client';

export interface Report {
  _id: string;
  user_id: string | {
    _id: string;
    username: string;
    email: string;
  };
  story_id: string | {
    _id: string;
    title: string;
    author: string | { _id: string; username: string; };
    coverImage?: string;
  };
  reason: string;
  status?: 'pending' | 'reviewed' | 'dismissed';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReportRequest {
  story_id: string;
  user_id: string;
  reason: string;
}

export interface UpdateReportRequest {
  reason?: string;
  status?: 'pending' | 'reviewed' | 'dismissed';
}

/**
 * API pour la gestion des signalements (admin uniquement)
 */
export const reportsApi = {
  /**
   * Créer un nouveau signalement
   */
  create: (reportData: CreateReportRequest): Promise<Report> => {
    return apiClient.post<Report>('/reports', reportData);
  },

  /**
   * Récupérer tous les signalements (admin uniquement)
   */
  getAll: (): Promise<Report[]> => {
    return apiClient.get<Report[]>('/reports');
  },

  /**
   * Récupérer un signalement par son ID (admin uniquement)
   */
  getById: (reportId: string): Promise<Report> => {
    return apiClient.get<Report>(`/reports/${reportId}`);
  },

  /**
   * Mettre à jour un signalement (admin uniquement)
   */
  update: (reportId: string, reportData: UpdateReportRequest): Promise<Report> => {
    return apiClient.patch<Report>(`/reports/${reportId}`, reportData);
  },

  /**
   * Supprimer un signalement (admin uniquement)
   */
  delete: (reportId: string): Promise<void> => {
    return apiClient.delete<void>(`/reports/${reportId}`);
  },
};

