'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ProfilePictureUpload({
  currentImage,
  onUpload,
  onDelete
}: ProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsModalOpen(true);
      setZoom(1);
      setCrop({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
      });
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current || !selectedFile) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Taille finale de l'image (400x400 pour une photo de profil)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], selectedFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, selectedFile]);

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    if (!croppedImage) return;

    console.log('📤 [ProfilePictureUpload] Début de l\'upload:', {
      fileName: croppedImage.name,
      fileSize: croppedImage.size,
      fileType: croppedImage.type,
      timestamp: new Date().toISOString()
    });

    setIsUploading(true);
    try {
      await onUpload(croppedImage);
      console.log('✅ [ProfilePictureUpload] Upload réussi');
      setIsModalOpen(false);
      setImageSrc('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ [ProfilePictureUpload] Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageSrc('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      try {
        await onDelete();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'image');
      }
    }
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const profileImageUrl = currentImage
    ? `${API_BASE_URL.replace('/api', '')}/uploads/${currentImage}`
    : null;

  return (
    <div className="space-y-4">
      {/* Preview de l'image actuelle */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Photo de profil"
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
              <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="profile-picture-input"
          />
          <label
            htmlFor="profile-picture-input"
            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
          >
            {currentImage ? 'Changer la photo' : 'Ajouter une photo'}
          </label>

          {currentImage && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Modal de rognage */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Rogner votre photo</h2>
              <p className="text-white/60 mt-1">Ajustez la zone de rognage et le zoom</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Contrôle de zoom */}
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                  Zoom: {zoom.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Zone de rognage */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Image à rogner"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
                      maxHeight: '60vh',
                    }}
                  />
                </ReactCrop>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUploading || !completedCrop}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Upload...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3B82F6;
          cursor: pointer;
          border-radius: 50%;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3B82F6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}

