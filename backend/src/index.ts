import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { Request, Response } from 'express';
import swaggerSpec from './swagger';
import authRouter from './routes/auth';
import { initDb } from './db';
import { createLogger } from './logger';

const log = createLogger('App');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// Convenience redirects → Swagger UI
const toSwagger = (_req: Request, res: Response) => res.redirect('/api/docs');
app.get('/', toSwagger);
app.get('/swagger', toSwagger);
app.get('/openapi', toSwagger);

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

initDb()
    .then(() => {
        app.listen(PORT, () => {
            log.info(`Backend running on http://localhost:${PORT}`);
            log.info(`Swagger UI:    http://localhost:${PORT}/api/docs`);
        });
    })
    .catch((err) => {
        log.error(`Failed to initialize database: ${err.message}`);
        process.exit(1);
    });