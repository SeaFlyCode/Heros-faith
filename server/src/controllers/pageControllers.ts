import type { Request, Response, NextFunction } from 'express';
import { Page } from '../models/page.js';

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

export async function deletePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageId } = req.params;
    const page = await Page.findByIdAndDelete(pageId);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

