import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
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

export async function getRatingsByStoryId(req: Request, res: Response, next: NextFunction) {
  try {
    const { storyId } = req.params;
    const ratings = await Rating.find({ story_id: new Types.ObjectId(storyId) })
      .populate('user_id', 'username')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    next(err);
  }
}

export async function getStoryAverageRating(req: Request, res: Response, next: NextFunction) {
  try {
    const { storyId } = req.params;
    const ratings = await Rating.find({ story_id: new Types.ObjectId(storyId) });

    if (ratings.length === 0) {
      return res.json({
        storyId,
        averageRating: 0,
        totalRatings: 0
      });
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    res.json({
      storyId,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: ratings.length
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserRatingForStory(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, storyId } = req.params;
    const rating = await Rating.findOne({
      user_id: new Types.ObjectId(userId),
      story_id: new Types.ObjectId(storyId)
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

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

