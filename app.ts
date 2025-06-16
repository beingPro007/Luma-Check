import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from "morgan"

dotenv.config({ path: './.env' });

const app = express();

app.use(express.json());
app.use(morgan('dev'))
app.use(cookieParser()); 

app.use(
  cors({
    origin: '*',
  })
);

import { userRoutes } from './routes/user.routes';

app.use('/api/v0/users', userRoutes);

export default app;
