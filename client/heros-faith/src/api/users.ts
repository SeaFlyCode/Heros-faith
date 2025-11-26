import { apiClient } from './client';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
  createdAt?: string;
  updatedAt?: string;
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
};

