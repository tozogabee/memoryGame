import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db';
import { sendVerificationEmail } from '../email';
import { createLogger } from '../logger';

const log = createLogger('AuthRoute');
const router = Router();
const changeMeInProduction = 'change-me-in-production';
const JWT_SECRET = process.env.JWT_SECRET || changeMeInProduction;
const production = 'production';
const IS_PRODUCTION = process.env.NODE_ENV === production;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000,
};

router.post('/register', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email and password are required' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomUUID();

        await pool.query(
            'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4)',
            [username, email.toLowerCase(), hash, verificationToken]
        );

        log.info(`New user registered: ${username} (${email})`);
        await sendVerificationEmail(email, username, verificationToken);

        res.status(201).json({ message: 'Registration successful. Please check your email to confirm your account.' });
    } catch (err: any) {
        if (err.code === '23505') {
            const field = err.detail?.includes('email') ? 'Email' : 'Username';
            log.warn(`Registration conflict - ${field} already taken: ${username}`);
            res.status(409).json({ error: `${field} is already taken` });
            return;
        }
        log.error(`Registration error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/verify/:token', async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const result = await pool.query(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id',
            [token]
        );

        if (result.rowCount === 0) {
            log.warn('Email verification failed — invalid or expired token');
            res.status(400).json({ error: 'Invalid or expired verification link' });
            return;
        }

        log.info(`Email verified for user id: ${result.rows[0].id}`);
        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err: any) {
        log.error(`Email verification error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            log.warn(`Failed login attempt for username: ${username}`);
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        if (!user.email_verified) {
            log.warn(`Login blocked — email not verified for: ${username}`);
            res.status(403).json({ error: 'Please confirm your email before logging in' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, COOKIE_OPTIONS);
        log.info(`User logged in: ${username}`);
        res.json({ username: user.username });
    } catch (err: any) {
        log.error(`Login error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', (req: Request, res: Response) => {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { username: string };
        log.debug(`Session valid for user: ${payload.username}`);
        res.json({ username: payload.username });
    } catch {
        log.warn('Expired or invalid session token — clearing cookie');
        res.clearCookie('token', COOKIE_OPTIONS);
        res.status(401).json({ error: 'Session expired' });
    }
});

router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    log.info('User logged out');
    res.json({ message: 'Logged out' });
});

export default router;