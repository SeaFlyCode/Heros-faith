import { apiClient } from './client';

// Interface pour l'auteur (populé depuis le backend)
export interface StoryAuthor {
  _id: string;
  username: string;
}

export interface Story {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  author: StoryAuthor | string; // Peut être un objet (populé) ou un ID string
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
  censorship?: {
    censored: boolean;
    admin?: string;
    censorshipDate?: string;
    reason?: string;
  };
  report?: {
    reported: boolean;
    reporter?: string;
    reportDate?: string;
  };
}

// Helper pour récupérer le nom d'affichage de l'auteur
export function getAuthorDisplayName(author: StoryAuthor | string): string {
  if (typeof author === 'string') {
    return author;
  }
  return author.username;
}

export interface CreateStoryRequest {
  title: string;
  description?: string;
  status?: 'draft' | 'published';
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
}

export interface UploadCoverImageResponse {
  message: string;
  coverImage: string;
  story: Story;
}

/**
 * API pour la gestion des histoires
 */
export const storiesApi = {
  /**
   * Créer une nouvelle histoire
   */
  create: (storyData: CreateStoryRequest): Promise<Story> => {
    return apiClient.post<Story>('/stories', storyData);
  },

  /**
   * Récupérer toutes les histoires
   */
  getAll: (): Promise<Story[]> => {
    return apiClient.get<Story[]>('/stories');
  },

  /**
   * Récupérer les histoires de l'utilisateur connecté
   */
  getMyStories: (): Promise<Story[]> => {
    return apiClient.get<Story[]>('/stories/my');
  },

  /**
   * Récupérer une histoire par son ID
   */
  getById: (storyId: string): Promise<Story> => {
    return apiClient.get<Story>(`/stories/${storyId}`);
  },

  /**
   * Mettre à jour une histoire
   */
  update: (storyId: string, storyData: UpdateStoryRequest): Promise<Story> => {
    return apiClient.patch<Story>(`/stories/${storyId}`, storyData);
  },

  /**
   * Supprimer une histoire
   */
  delete: (storyId: string): Promise<void> => {
    return apiClient.delete<void>(`/stories/${storyId}`);
  },

  /**
   * Uploader une image de couverture
   */
  uploadCoverImage: async (storyId: string, file: File): Promise<UploadCoverImageResponse> => {
    const formData = new FormData();
    formData.append('coverImage', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/stories/${storyId}/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }

    return response.json();
  },

  /**
   * Supprimer l'image de couverture
   */
  deleteCoverImage: (storyId: string): Promise<{ message: string; story: Story }> => {
    return apiClient.delete(`/stories/${storyId}/cover`);
  },

  // ===== Admin API =====

  /**
   * Récupérer toutes les histoires (admin)
   */
  getAllAdmin: (): Promise<Story[]> => {
    return apiClient.get<Story[]>('/stories/admin/all');
  },

  /**
   * Censurer une histoire (admin)
   */
  censor: (storyId: string, reason?: string): Promise<{ message: string; story: Story }> => {
    return apiClient.post(`/stories/${storyId}/censor`, { reason });
  },

  /**
   * Lever la censure d'une histoire (admin)
   */
  uncensor: (storyId: string): Promise<{ message: string; story: Story }> => {
    return apiClient.post(`/stories/${storyId}/uncensor`, {});
  },
};

