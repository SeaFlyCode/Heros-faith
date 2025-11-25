import type { Request, Response, NextFunction } from 'express';
import { Party } from '../models/party.ts';

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

