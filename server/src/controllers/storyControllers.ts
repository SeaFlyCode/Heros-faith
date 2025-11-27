import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { Story } from '../models/story.ts';
import fs from 'fs';
import path from 'path';
import { uploadsPath } from '../middlewares/uploadMiddleware.ts';

// Extension de l'interface Request pour inclure user et file
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
  file?: Express.Multer.File | undefined;
}

// Récupérer toutes les stories
export async function getAllStories(req: Request, res: Response, next: NextFunction) {
  try {
    const stories = await Story.find().populate('author', 'username');
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

    // Vérifier que le title est fourni
    if (!title) {
      return res.status(400).json({ message: 'Title est requis' });
    }

    // Récupérer l'ID de l'utilisateur depuis le JWT
    const author = (req.user as JwtPayload)?.userId;
    if (!author) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const story = new Story({
      title,
      content,
      description,
      status: status || 'draft',
      author
    });
    await story.save();
    res.status(201).json(story);
  } catch (err) {
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

        // Vérifier qu'un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({ message: 'Aucune image fournie' });
        }

        // Récupérer l'histoire
        const story = await Story.findById(storyId);
        if (!story) {
            // Supprimer le fichier uploadé si l'histoire n'existe pas
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Story not found' });
        }

        // Vérifier que l'utilisateur est l'auteur
        if (story.author.toString() !== userId && userRole !== 'admin') {
            // Supprimer le fichier uploadé
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette histoire' });
        }

        // Supprimer l'ancienne image si elle existe
        if (story.coverImage) {
            const oldImagePath = path.join(uploadsPath, path.basename(story.coverImage));
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Mettre à jour l'histoire avec le chemin de la nouvelle image
        const imageUrl = `/uploads/${req.file.filename}`;
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            { coverImage: imageUrl },
            { new: true }
        );

        res.json({ 
            message: 'Image uploadée avec succès',
            coverImage: imageUrl,
            story: updatedStory
        });
    } catch (err) {
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