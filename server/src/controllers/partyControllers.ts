import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Party } from '../models/party.ts';
import { Page } from '../models/page.ts';

export async function createParty(req: Request, res: Response, next: NextFunction) {
  try {
    const party = new Party(req.body);
    await party.save();
    res.status(201).json(party);
  } catch (err) {
    next(err);
  }
}

export async function getAllParties(req: Request, res: Response, next: NextFunction) {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (err) {
    next(err);
  }
}

export async function getPartyById(req: Request, res: Response, next: NextFunction) {
  try {
    const { partyId } = req.params;
    const party = await Party.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    next(err);
  }
}

export async function getPartiesByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const parties = await Party.find({ user_id: new Types.ObjectId(userId) })
      .populate('story_id', 'title description author')
      .sort({ start_date: -1 });
    res.json(parties);
  } catch (err) {
    next(err);
  }
}

export async function getPartyByUserAndStory(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, storyId } = req.params;
    const party = await Party.findOne({
      user_id: new Types.ObjectId(userId),
      story_id: new Types.ObjectId(storyId)
    }).sort({ start_date: -1 }); // Get the most recent party

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    res.json(party);
  } catch (err) {
    next(err);
  }
}

export async function getPartyProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { partyId } = req.params;
    const party = await Party.findById(partyId);

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    // Count total pages in the story
    const totalPages = await Page.countDocuments({ story_id: party.story_id });

    // Calculate progress percentage
    const visitedPages = party.path.length;
    const progress = totalPages > 0 ? Math.round((visitedPages / totalPages) * 100) : 0;

    res.json({
      partyId: party._id,
      storyId: party.story_id,
      visitedPages,
      totalPages,
      progress,
      isCompleted: !!party.end_date
    });
  } catch (err) {
    next(err);
  }
}

export async function updateParty(req: Request, res: Response, next: NextFunction) {
  try {
    const { partyId } = req.params;
    const updates = req.body;
    const party = await Party.findByIdAndUpdate(partyId, updates, { new: true });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    next(err);
  }
}

export async function deleteParty(req: Request, res: Response, next: NextFunction) {
  try {
    const { partyId } = req.params;
    const party = await Party.findByIdAndDelete(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

