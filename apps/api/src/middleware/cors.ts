import cors from 'cors';
import { env } from '../config/env';

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
