import type { Request, Response, NextFunction } from 'express';
import { Rating } from '../models/rating.ts';

export async function createRating(req: Request, res: Response, next: NextFunction) {
  try {
    const rating = new Rating(req.body);
    await rating.save();
    res.status(201).json(rating);
  } catch (err) {
    next(err);
  }
}

export async function getAllRatings(req: Request, res: Response, next: NextFunction) {
  try {
    const ratings = await Rating.find();
    res.json(ratings);
  } catch (err) {
    next(err);
  }
}

export async function getRatingById(req: Request, res: Response, next: NextFunction) {
  try {
    const { ratingId } = req.params;
    const rating = await Rating.findById(ratingId);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.json(rating);
  } catch (err) {
    next(err);
  }
}

export async function updateRating(req: Request, res: Response, next: NextFunction) {
  try {
    const { ratingId } = req.params;
    const updates = req.body;
    const rating = await Rating.findByIdAndUpdate(ratingId, updates, { new: true });
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.json(rating);
  } catch (err) {
    next(err);
  }
}

export async function deleteRating(req: Request, res: Response, next: NextFunction) {
  try {
    const { ratingId } = req.params;
    const rating = await Rating.findByIdAndDelete(ratingId);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

