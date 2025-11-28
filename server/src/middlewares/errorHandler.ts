import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const isDev = process.env.NODE_ENV === 'development';
    const status = err.status || 500;
    const message = err.message || 'Erreur interne du serveur';

    if (isDev) {
        // En mode dev, on affiche le stack et les détails
        res.status(status).json({
            status,
            message,
            stack: err.stack,
            error: err
        });
    } else {
        // En prod, on masque les détails
        res.status(status).json({
            status,
            message
        });
    }
}