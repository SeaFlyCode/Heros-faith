import type { Request, Response, NextFunction } from 'express';
import { Story } from '../models/story.js';

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
export async function createStory(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, author } = req.body;
    const story = new Story({ title, content, author });
    await story.save();
    res.status(201).json(story);
  } catch (err) {
    next(err); // Passe l'erreur au errorHandler
  }
}
// ... Tu peux ajouter d'autres méthodes (get, update, delete, etc.) en suivant ce modèle ...
