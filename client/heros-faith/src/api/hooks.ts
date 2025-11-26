import { useState, useCallback } from 'react';
import { ApiError } from './client';

/**
 * Hook personnalisé pour gérer les appels API avec état de chargement et erreur
 */
export function useApi<T, Args extends any[] = []>(
  apiCall: (...args: Args) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
}

/**
 * Hook pour gérer l'authentification utilisateur
 */
export function useAuth() {
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  const getUser = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getToken();
  }, [getToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return {
    getToken,
    getUser,
    isAuthenticated,
    logout,
  };
}

