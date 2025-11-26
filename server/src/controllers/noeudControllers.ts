import type { Request, Response, NextFunction } from 'express';
import { Noeud } from '../models/noeud.ts';

export async function createNoeud(req: Request, res: Response, next: NextFunction) {
  try {
    const noeud = new Noeud(req.body);
    await noeud.save();
    res.status(201).json(noeud);
  } catch (err) {
    next(err);
  }
}

export async function getAllNoeuds(req: Request, res: Response, next: NextFunction) {
  try {
    const noeuds = await Noeud.find();
    res.json(noeuds);
  } catch (err) {
    next(err);
  }
}

export async function getNoeudById(req: Request, res: Response, next: NextFunction) {
  try {
    const { noeudId } = req.params;
    const noeud = await Noeud.findById(noeudId);
    if (!noeud) return res.status(404).json({ message: 'Noeud not found' });
    res.json(noeud);
  } catch (err) {
    next(err);
  }
}

export async function updateNoeud(req: Request, res: Response, next: NextFunction) {
  try {
    const { noeudId } = req.params;
    const updates = req.body;
    const noeud = await Noeud.findByIdAndUpdate(noeudId, updates, { new: true });
    if (!noeud) return res.status(404).json({ message: 'Noeud not found' });
    res.json(noeud);
  } catch (err) {
    next(err);
  }
}

export async function deleteNoeud(req: Request, res: Response, next: NextFunction) {
  try {
    const { noeudId } = req.params;
    const noeud = await Noeud.findByIdAndDelete(noeudId);
    if (!noeud) return res.status(404).json({ message: 'Noeud not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

