import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createLogger } from '../logger';

const log = createLogger('AuthMiddleware');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface AuthRequest extends Request {
    userId?: number;
    username?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
        req.userId = payload.userId;
        req.username = payload.username;
        log.debug(`Authenticated request from user: ${payload.username}`);
        next();
    } catch {
        log.warn('Invalid or expired token on protected route');
        res.status(401).json({ error: 'Session expired' });
    }
}