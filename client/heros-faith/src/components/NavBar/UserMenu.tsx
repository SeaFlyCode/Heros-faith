"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getProfileImageUrl } from '@/utils/imageUrl';

interface UserMenuProps {
  username: string;
  profilePicture?: string;
  onLogout: () => void;
}

export default function UserMenu({ username, profilePicture, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Log pour tracer la photo de profil
  useEffect(() => {
    if (profilePicture) {
      const imageUrl = getProfileImageUrl(profilePicture);
      console.log('📸 [NavBar] Chargement de la photo de profil:', {
        profilePicture,
        imageUrl,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('📸 [NavBar] Aucune photo de profil définie');
    }
  }, [profilePicture]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton Mon Compte */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 font-medium font-montserrat hover:text-yellow-400 transition-colors text-white drop-shadow"
      >
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          {profilePicture ? (
            <img
              src={getProfileImageUrl(profilePicture) || ''}
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <span>{username}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-dropdown">
          {/* En-tête du menu */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm text-white/60">Connecté en tant que</p>
            <p className="text-white font-semibold truncate">{username}</p>
          </div>

          {/* Items du menu */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-white no-underline"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Mon profil</span>
            </Link>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-500/10 transition-colors text-red-400 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* Styles pour l'animation */}
      <style jsx>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

