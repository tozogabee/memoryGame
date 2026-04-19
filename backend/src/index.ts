import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import authRouter from './routes/auth';
import { initDb } from './db';

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

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Backend running on http://localhost:${PORT}`);
            console.log(`Swagger UI:    http://localhost:${PORT}/api/docs`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });