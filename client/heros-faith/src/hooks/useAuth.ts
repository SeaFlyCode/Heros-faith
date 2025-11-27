"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/api/users';
import { usersApi } from '@/api/users';

export type { User };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    checkAuth();

    // Rafraîchir les données depuis le serveur si l'utilisateur est connecté
    const refreshData = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log('🔄 [useAuth] Rafraîchissement automatique des données au démarrage');
          const freshUserData = await usersApi.getById(userData._id);
          localStorage.setItem('user', JSON.stringify(freshUserData));
          setUser(freshUserData);
          console.log('✅ [useAuth] Données rafraîchies:', {
            username: freshUserData.username,
            profilePicture: freshUserData.profilePicture || 'non définie'
          });
        } catch (error) {
          console.error('❌ [useAuth] Erreur lors du rafraîchissement automatique:', error);
          // En cas d'erreur, on garde les données du localStorage
        }
      }
      setIsLoading(false);
    };

    refreshData();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        console.log('✅ Utilisateur connecté:', userData.username);
      } else {
        setUser(null);
        console.log('❌ Aucun utilisateur connecté');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('✅ [useAuth] Connexion réussie:', {
      username: userData.username,
      email: userData.email,
      profilePicture: userData.profilePicture || 'non définie',
      timestamp: new Date().toISOString()
    });
    if (userData.profilePicture) {
      console.log('📸 [useAuth] Photo de profil lors de la connexion:', userData.profilePicture);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('👋 Déconnexion réussie');
    router.push('/');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    console.log('🔄 [useAuth] Utilisateur mis à jour:', {
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture || 'non définie',
      timestamp: new Date().toISOString()
    });

    if (updatedUser.profilePicture) {
      console.log('📸 [useAuth] Nouvelle photo de profil:', updatedUser.profilePicture);
    }
  };

  const refreshUserFromServer = async () => {
    try {
      if (!user?._id) {
        console.log('❌ [useAuth] Impossible de rafraîchir: pas d\'utilisateur connecté');
        return;
      }

      console.log('🔄 [useAuth] Rafraîchissement depuis le serveur pour:', user.username);
      const freshUserData = await usersApi.getById(user._id);

      console.log('✅ [useAuth] Données fraîches récupérées:', {
        username: freshUserData.username,
        profilePicture: freshUserData.profilePicture || 'non définie',
        timestamp: new Date().toISOString()
      });

      // Mettre à jour le localStorage et l'état
      localStorage.setItem('user', JSON.stringify(freshUserData));
      setUser(freshUserData);

      if (freshUserData.profilePicture) {
        console.log('📸 [useAuth] Photo de profil après rafraîchissement:', freshUserData.profilePicture);
      }
    } catch (error) {
      console.error('❌ [useAuth] Erreur lors du rafraîchissement:', error);
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    updateUser,
    refreshUserFromServer,
  };
}

