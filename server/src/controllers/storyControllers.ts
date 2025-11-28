import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { Story } from '../models/story';
import fs from 'fs';
import path from 'path';
import { uploadsPath } from '../middlewares/uploadMiddleware';

// Extension de l'interface Request pour inclure user et file
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
  file?: Express.Multer.File | undefined;
}

// Récupérer toutes les stories (exclut les censurées pour les utilisateurs normaux)
export async function getAllStories(req: Request, res: Response, next: NextFunction) {
  try {
    // Exclure les histoires censurées et ne montrer que les publiées
    const stories = await Story.find({ 
      'censorship.censored': { $ne: true },
      status: 'published'
    }).populate('author', 'username');
    res.json(stories);
  } catch (err) {
    next(err); // Passe l'erreur au errorHandler
  }
}

// Récupérer les histoires de l'utilisateur connecté
export async function getMyStories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as JwtPayload)?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const stories = await Story.find({ author: userId }).populate('author', 'username');
    console.log(`✅ Histoires de l'utilisateur ${userId}:`, stories.length);
    res.json(stories);
  } catch (err) {
    next(err);
  }
}

// Créer une nouvelle story
export async function createStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, content, description, status } = req.body;

    console.log('📝 [Story] Création d\'une nouvelle histoire');
    console.log('📝 [Story] Données reçues:', { title, description, status });

    // Vérifier que le title est fourni
    if (!title) {
      console.log('❌ [Story] Titre manquant');
      return res.status(400).json({ message: 'Title est requis' });
    }

    // Récupérer l'ID de l'utilisateur depuis le JWT
    const author = (req.user as JwtPayload)?.userId;
    if (!author) {
      console.log('❌ [Story] Utilisateur non authentifié');
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    console.log('📝 [Story] Auteur:', author);

    const story = new Story({
      title,
      content,
      description,
      status: status || 'draft',
      author
    });

    await story.save();
    console.log('✅ [Story] Histoire créée avec succès:', story._id);

    res.status(201).json(story);
  } catch (err) {
    console.log('❌ [Story] Erreur lors de la création:', err);
    next(err); // Passe l'erreur au errorHandler
  }
}

export async function getStoryById(req: Request, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const story = await Story.findById(storyId).populate('author', 'username');
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (err) {
        next(err);
    }
}

export async function updateStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const updates = req.body;

        // Récupérer l'histoire
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Vérifier que l'utilisateur est l'auteur de l'histoire
        const userId = (req.user as JwtPayload)?.userId;
        const userRole = (req.user as JwtPayload)?.role;

        if (story.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette histoire' });
        }

        // Mettre à jour l'histoire
        const updatedStory = await Story.findByIdAndUpdate(storyId, updates, { new: true });
        res.json(updatedStory);
    } catch (err) {
        next(err);
    }
}

export async function deleteStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const userId = (req.user as JwtPayload)?.userId;
        const userRole = (req.user as JwtPayload)?.role;

        // Trouver l'histoire d'abord pour vérifier l'auteur
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Vérifier que l'utilisateur est l'auteur ou un admin
        if (story.author.toString() !== userId?.toString() && userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied: You can only delete your own stories' });
        }

        // Supprimer l'image de couverture si elle existe
        if (story.coverImage) {
            const imagePath = path.join(uploadsPath, path.basename(story.coverImage));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Supprimer l'histoire (le hook pre('findOneAndDelete') s'occupera de la suppression en cascade)
        await Story.findByIdAndDelete(storyId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

// Uploader une image de couverture pour une histoire
export async function uploadCoverImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const userId = (req.user as JwtPayload)?.userId;
        const userRole = (req.user as JwtPayload)?.role;

        console.log('📤 [Upload Cover] Début de l\'upload pour l\'histoire:', storyId);
        console.log('📤 [Upload Cover] Utilisateur:', userId);

        // Vérifier qu'un fichier a été uploadé
        if (!req.file) {
            console.log('❌ [Upload Cover] Aucun fichier fourni');
            return res.status(400).json({ message: 'Aucune image fournie' });
        }

        console.log('📤 [Upload Cover] Fichier reçu:', {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        // Récupérer l'histoire
        const story = await Story.findById(storyId);
        if (!story) {
            console.log('❌ [Upload Cover] Histoire non trouvée:', storyId);
            // Supprimer le fichier uploadé si l'histoire n'existe pas
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Story not found' });
        }

        console.log('✅ [Upload Cover] Histoire trouvée:', story.title);

        // Vérifier que l'utilisateur est l'auteur
        if (story.author.toString() !== userId && userRole !== 'admin') {
            console.log('❌ [Upload Cover] Accès non autorisé');
            // Supprimer le fichier uploadé
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette histoire' });
        }

        // Supprimer l'ancienne image si elle existe
        if (story.coverImage) {
            const oldImagePath = path.join(uploadsPath, path.basename(story.coverImage));
            console.log('🗑️ [Upload Cover] Suppression de l\'ancienne image:', oldImagePath);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log('✅ [Upload Cover] Ancienne image supprimée');
            }
        }

        // Mettre à jour l'histoire avec le chemin de la nouvelle image
        const imageUrl = `/api/uploads/${req.file.filename}`;
        console.log('💾 [Upload Cover] URL de la nouvelle image:', imageUrl);

        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            { coverImage: imageUrl },
            { new: true }
        );

        console.log('✅ [Upload Cover] Image de couverture mise à jour avec succès');
        console.log('✅ [Upload Cover] Chemin complet du fichier:', req.file.path);

        res.json({
            message: 'Image uploadée avec succès',
            coverImage: imageUrl,
            story: updatedStory
        });
    } catch (err) {
        console.log('❌ [Upload Cover] Erreur:', err);
        // Supprimer le fichier en cas d'erreur
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
}

// Supprimer l'image de couverture d'une histoire
export async function deleteCoverImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const userId = (req.user as JwtPayload)?.userId;
        const userRole = (req.user as JwtPayload)?.role;

        // Récupérer l'histoire
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Vérifier que l'utilisateur est l'auteur
        if (story.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette histoire' });
        }

        // Supprimer l'image si elle existe
        if (story.coverImage) {
            const imagePath = path.join(uploadsPath, path.basename(story.coverImage));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Mettre à jour l'histoire
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            { $unset: { coverImage: 1 } },
            { new: true }
        );

        res.json({ 
            message: 'Image supprimée avec succès',
            story: updatedStory
        });
    } catch (err) {
        next(err);
    }
}

// Censurer une histoire (admin seulement)
export async function censorStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const { reason } = req.body;
        const adminId = (req.user as JwtPayload)?.userId;
        const userRole = (req.user as JwtPayload)?.role;

        // Vérifier que l'utilisateur est admin
        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé : seuls les administrateurs peuvent censurer des histoires' });
        }

        // Récupérer l'histoire
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Histoire non trouvée' });
        }

        // Mettre à jour la censure
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            {
                censorship: {
                    censored: true,
                    admin: adminId,
                    censorshipDate: new Date(),
                    reason: reason || 'Contenu inapproprié'
                }
            },
            { new: true }
        ).populate('author', 'username email');

        console.log(`🚫 [Admin] Histoire "${story.title}" censurée par l'admin ${adminId}`);

        res.json({
            message: 'Histoire censurée avec succès',
            story: updatedStory
        });
    } catch (err) {
        next(err);
    }
}

// Lever la censure d'une histoire (admin seulement)
export async function uncensorStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const adminId = (req.user as JwtPayload)?.userId;
        const userRole = (req.user as JwtPayload)?.role;

        // Vérifier que l'utilisateur est admin
        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé : seuls les administrateurs peuvent lever la censure' });
        }

        // Récupérer l'histoire
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Histoire non trouvée' });
        }

        // Lever la censure
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            {
                censorship: {
                    censored: false,
                    admin: undefined,
                    censorshipDate: undefined,
                    reason: undefined
                }
            },
            { new: true }
        ).populate('author', 'username email');

        console.log(`✅ [Admin] Censure levée pour l'histoire "${story.title}" par l'admin ${adminId}`);

        res.json({
            message: 'Censure levée avec succès',
            story: updatedStory
        });
    } catch (err) {
        next(err);
    }
}

// Récupérer toutes les histoires (admin - inclut les censurées)
export async function getAllStoriesAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userRole = (req.user as JwtPayload)?.role;

        // Vérifier que l'utilisateur est admin
        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé : seuls les administrateurs peuvent accéder à cette ressource' });
        }

        const stories = await Story.find()
            .populate('author', 'username email')
            .populate('censorship.admin', 'username')
            .sort({ createdAt: -1 });

        res.json(stories);
    } catch (err) {
        next(err);
    }
}