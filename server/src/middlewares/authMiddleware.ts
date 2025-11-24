import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// Extension de l'interface Request pour inclure user
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

// Middleware d'authentification JWT
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!token) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET non défini dans les variables d\'environnement.' });
  }
  try {
    req.user = jwt.verify(token as string, secret as string);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
}
