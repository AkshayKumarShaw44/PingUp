import 'dotenv/config'; // This is the cleanest way to ensure it loads first
import express from 'express';
import cors from 'cors';
import { connectDB } from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';
import { clerkMiddleware } from '@clerk/express';
import userRouter from './routes/user.route.js';

const PORT = process.env.PORT || 4000;
const app = express();

// Connect to MongoDB Atlas
connectDB();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is running'));

// Inngest Endpoint
app.use('/api/inngest', serve({ client: inngest, functions: functions }));

// User Routes
app.use('/api/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on number: ${PORT}`);
});