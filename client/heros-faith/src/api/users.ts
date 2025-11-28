import { apiClient } from './client';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
  avatar?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  storiesWritten: number;
  pagesWritten: number;
  storiesRead: number;
  totalParties: number;
  completedParties: number;
  averageRating: number;
  totalRatingsReceived: number;
  ratingsGiven: number;
  memberSince?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'creator' | 'admin';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  role?: 'user' | 'creator' | 'admin';
  avatar?: string;
}

/**
 * API pour la gestion des utilisateurs
 */
export const usersApi = {
  /**
   * Connexion d'un utilisateur
   */
  login: (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/users/login', credentials);
  },

  /**
   * Créer un nouvel utilisateur (inscription)
   */
  create: (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>('/users', userData);
  },

  /**
   * Récupérer tous les utilisateurs (admin uniquement)
   */
  getAll: (): Promise<User[]> => {
    return apiClient.get<User[]>('/users');
  },

  /**
   * Récupérer un utilisateur par son ID
   */
  getById: (userId: string): Promise<User> => {
    return apiClient.get<User>(`/users/${userId}`);
  },

  /**
   * Récupérer les statistiques d'un utilisateur
   */
  getStats: (userId: string): Promise<UserStats> => {
    return apiClient.get<UserStats>(`/users/${userId}/stats`);
  },

  /**
   * Mettre à jour un utilisateur
   */
  update: (userId: string, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.patch<User>(`/users/${userId}`, userData);
  },

  /**
   * Supprimer un utilisateur (admin uniquement)
   */
  delete: (userId: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${userId}`);
  },

  /**
   * Upload une photo de profil
   */
  uploadProfilePicture: async (userId: string, file: File): Promise<{ message: string; profilePicture: string; profilePictureUrl: string }> => {
    console.log('📤 [API] Début de l\'upload de la photo de profil:', {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString()
    });

    const formData = new FormData();
    formData.append('profilePicture', file);

    const uploadUrl = `${apiClient.baseURL}/users/${userId}/profile-picture`;
    console.log('📤 [API] URL d\'upload:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [API] Erreur lors de l\'upload:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }

    const result = await response.json();
    console.log('✅ [API] Upload réussi:', {
      profilePicture: result.profilePicture,
      profilePictureUrl: result.profilePictureUrl,
      timestamp: new Date().toISOString()
    });

    return result;
  },

  /**
   * Supprimer la photo de profil
   */
  deleteProfilePicture: (userId: string): Promise<{ message: string }> => {
    console.log('🗑️ [API] Suppression de la photo de profil:', {
      userId,
      timestamp: new Date().toISOString()
    });
    return apiClient.delete<{ message: string }>(`/users/${userId}/profile-picture`);
  },
};