import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createLogger } from '../logger';

const log = createLogger('ScoresRoute');
const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    const { score, duration_seconds } = req.body;

    if (score == null || duration_seconds == null) {
        res.status(400).json({ error: 'score and duration_seconds are required' });
        return;
    }
    if (!Number.isInteger(score) || score < 0) {
        res.status(400).json({ error: 'score must be a non-negative integer' });
        return;
    }
    if (!Number.isInteger(duration_seconds) || duration_seconds < 0) {
        res.status(400).json({ error: 'duration_seconds must be a non-negative integer' });
        return;
    }

    try {
        const result = await pool.query(
            'INSERT INTO scores (user_id, score, duration_seconds) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, score, duration_seconds]
        );
        log.info(`Score saved for user ${req.username}: score=${score}, duration=${duration_seconds}s`);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        log.error(`Failed to save score: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, score, duration_seconds, created_at
             FROM scores
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [req.userId]
        );
        log.debug(`Fetched ${result.rowCount} scores for user: ${req.username}`);
        res.json(result.rows);
    } catch (err: any) {
        log.error(`Failed to fetch scores: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/ranking', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT u.username, s.score, s.duration_seconds, s.created_at
             FROM scores s
             JOIN users u ON u.id = s.user_id
             ORDER BY s.score DESC, s.duration_seconds ASC
             LIMIT 50`
        );
        log.debug(`Fetched ${result.rowCount} entries for ranking`);
        res.json(result.rows);
    } catch (err: any) {
        log.error(`Failed to fetch ranking: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
