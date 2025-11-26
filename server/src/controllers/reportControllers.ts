import type { Request, Response, NextFunction } from 'express';
import { Report } from '../models/report.ts';

export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
}

export async function getAllReports(req: Request, res: Response, next: NextFunction) {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    next(err);
  }
}

export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function updateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { reportId } = req.params;
    const updates = req.body;
    const report = await Report.findByIdAndUpdate(reportId, updates, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function deleteReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { reportId } = req.params;
    const report = await Report.findByIdAndDelete(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

