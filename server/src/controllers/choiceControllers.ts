import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Choice } from '../models/choice';
import { Page } from '../models/page';
import { Story } from '../models/story';

// Extension de l'interface Request pour inclure user
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export async function createChoice(req: Request, res: Response, next: NextFunction) {
  try {
    const choice = new Choice(req.body);
    await choice.save();
    res.status(201).json(choice);
  } catch (err) {
    next(err);
  }
}

export async function getAllChoices(req: Request, res: Response, next: NextFunction) {
  try {
    const choices = await Choice.find();
    res.json(choices);
  } catch (err) {
    next(err);
  }
}

export async function getChoiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const { choiceId } = req.params;
    const choice = await Choice.findById(choiceId);
    if (!choice) return res.status(404).json({ message: 'Choice not found' });
    res.json(choice);
  } catch (err) {
    next(err);
  }
}

export async function getChoicesByPageId(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageId } = req.params;
    console.log(`📋 Récupération des choix pour la page: ${pageId}`);

    const choices = await Choice.find({ page_id: new Types.ObjectId(pageId) });
    console.log(`✅ Choix trouvés: ${choices.length}`);
    console.log(`📋 Détails des choix:`, JSON.stringify(choices, null, 2));

    res.json(choices);
  } catch (err) {
    console.error(`❌ Erreur lors de la récupération des choix pour la page ${req.params.pageId}:`, err);
    next(err);
  }
}

export async function updateChoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { choiceId } = req.params;
    const updates = req.body;
    const choice = await Choice.findByIdAndUpdate(choiceId, updates, { new: true });
    if (!choice) return res.status(404).json({ message: 'Choice not found' });
    res.json(choice);
  } catch (err) {
    next(err);
  }
}

export async function deleteChoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { choiceId } = req.params;
    const userId = (req.user as JwtPayload)?.userId;
    const userRole = (req.user as JwtPayload)?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Trouver le choix
    const choice = await Choice.findById(choiceId);
    if (!choice) return res.status(404).json({ message: 'Choice not found' });

    // Trouver la page associée
    const page = await Page.findById(choice.page_id);
    if (!page) return res.status(404).json({ message: 'Page not found' });

    // Vérifier que l'utilisateur est le propriétaire de l'histoire
    const story = await Story.findById(page.story_id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Permettre la suppression si l'utilisateur est l'auteur OU un admin
    if (story.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied: you can only delete choices from your own stories' });
    }

    // Supprimer le choix
    await Choice.findByIdAndDelete(choiceId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

