import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authMiddleware.js';

export function roleMiddleware(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || !user.role) {
      return res.status(403).json({ message: 'Accès refusé : rôle manquant.' });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: `Accès refusé : rôle requis = ${role}` });
    }
    next();
  };
}

