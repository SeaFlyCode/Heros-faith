import type { Request, Response, NextFunction } from 'express';
import { Report } from '../models/report';

export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("🚨 [REPORT] Création d'un nouveau signalement:", req.body);
    
    // Vérifier si l'utilisateur a déjà signalé cette histoire
    const existingReport = await Report.findOne({
      user_id: req.body.user_id,
      story_id: req.body.story_id
    });
    
    if (existingReport) {
      return res.status(400).json({ 
        message: 'Vous avez déjà signalé cette histoire' 
      });
    }
    
    const report = new Report(req.body);
    await report.save();
    console.log("✅ [REPORT] Signalement enregistré avec succès:", report);
    res.status(201).json(report);
  } catch (err: any) {
    console.error("❌ [REPORT] Erreur lors de la création du signalement:", err);
    res.status(400).json({ 
      message: err.message || 'Erreur lors de la création du signalement',
      details: err.errors || {}
    });
  }
}

export async function getAllReports(req: Request, res: Response, next: NextFunction) {
  try {
    const reports = await Report.find()
      .populate('story_id', 'title author coverImage')
      .populate('user_id', 'username email')
      .sort({ createdAt: -1 });
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

