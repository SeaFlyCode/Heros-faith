import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Choice } from '../models/choice';

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

export async function deleteChoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { choiceId } = req.params;
    const choice = await Choice.findByIdAndDelete(choiceId);
    if (!choice) return res.status(404).json({ message: 'Choice not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

