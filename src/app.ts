import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimiter from './middleware/rateLimiter';
import { connectDB } from './config/db';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import logger from './logger';

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (s) => logger.http(s.trim()) } }));
app.use(rateLimiter);

app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

app.use('/api', routes);

app.use(errorHandler);

export default app;
