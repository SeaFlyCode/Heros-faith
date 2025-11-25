import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { Story } from '../models/story.ts';

// Extension de l'interface Request pour inclure user
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

// Récupérer toutes les stories
export async function getAllStories(req: Request, res: Response, next: NextFunction) {
  try {
    const stories = await Story.find();
    res.json(stories);
  } catch (err) {
    next(err); // Passe l'erreur au errorHandler
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
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (err) {
        next(err);
    }
}

export async function updateStory(req: Request, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const updates = req.body;
        const story = await Story.findByIdAndUpdate(storyId, updates, { new: true });
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (err) {
        next(err);
    }
}

export async function deleteStory(req: Request, res: Response, next: NextFunction) {
    try {
        const { storyId } = req.params;
        const story = await Story.findByIdAndDelete(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}