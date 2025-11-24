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