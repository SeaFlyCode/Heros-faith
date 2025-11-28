import { apiClient } from './client';

export interface Report {
  id: number;
  userId: number;
  storyId: number;
  reason: string;
  description?: string;
  status?: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReportRequest {
  storyId: number;
  reason: string;
  description?: string;
}

export interface UpdateReportRequest {
  reason?: string;
  description?: string;
  status?: 'pending' | 'reviewed' | 'resolved' | 'rejected';
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
  getById: (reportId: number): Promise<Report> => {
    return apiClient.get<Report>(`/reports/${reportId}`);
  },

  /**
   * Mettre à jour un signalement (admin uniquement)
   */
  update: (reportId: number, reportData: UpdateReportRequest): Promise<Report> => {
    return apiClient.patch<Report>(`/reports/${reportId}`, reportData);
  },

  /**
   * Supprimer un signalement (admin uniquement)
   */
  delete: (reportId: number): Promise<void> => {
    return apiClient.delete<void>(`/reports/${reportId}`);
  },
};

