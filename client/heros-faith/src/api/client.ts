/**
 * Client API configuré pour gérer l'authentification JWT
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiError {
  message: string;
  status?: number;
  errors?: any;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère le token JWT depuis le localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Construit les headers de la requête avec le token JWT si disponible
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Gère les erreurs de l'API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Une erreur est survenue';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          errors: errorData.errors,
        };
        throw error;
      } catch (e) {
        if ((e as ApiError).message) {
          throw e;
        }
        throw {
          message: errorMessage,
          status: response.status,
        } as ApiError;
      }
    }

    // Si la réponse est vide (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Requête GET
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(options?.headers),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête POST
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête PATCH
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête PUT
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête DELETE
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(options?.headers),
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

// Instance par défaut du client API
export const apiClient = new ApiClient();

