import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Page } from '../models/page';
import { Story } from '../models/story';

// Extension de l'interface Request pour inclure user
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export async function createPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = new Page(req.body);
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    next(err);
  }
}

export async function getAllPages(req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (err) {
    next(err);
  }
}

export async function getPageById(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageId } = req.params;
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
}

export async function getPagesByStoryId(req: Request, res: Response, next: NextFunction) {
  try {
    const { storyId } = req.params;
    const pages = await Page.find({ story_id: new Types.ObjectId(storyId) });
    res.json(pages);
  } catch (err) {
    next(err);
  }
}

export async function updatePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageId } = req.params;
    const updates = req.body;
    const page = await Page.findByIdAndUpdate(pageId, updates, { new: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
}

export async function deletePage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { pageId } = req.params;
    const userId = (req.user as JwtPayload)?.userId;
    const userRole = (req.user as JwtPayload)?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Trouver la page
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ message: 'Page not found' });

    // Vérifier que l'utilisateur est le propriétaire de l'histoire
    const story = await Story.findById(page.story_id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Permettre la suppression si l'utilisateur est l'auteur OU un admin
    if (story.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied: you can only delete pages from your own stories' });
    }

    // Supprimer la page
    await Page.findByIdAndDelete(pageId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

