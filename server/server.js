import 'dotenv/config'; // <--- THIS MUST BE LINE 1
import express from "express";
import cors from "cors";
import { connectDB } from "./configs/db.js";
import {inngest, functions} from "./inngest/index.js"
import { clerkMiddleware, requireAuth } from '@clerk/express'
import { serve } from "inngest/express";
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import storyRouter from './routes/story.route.js';
import messageRouter from './routes/message.route.js';
import commentRouter from './routes/comment.route.js';


const app = express();

connectDB()

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(clerkMiddleware());


const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/user", userRouter)

app.use("/api/post", postRouter)

app.use("/api/story", storyRouter)

app.use('/api/message',messageRouter)
app.use('/api/comment', commentRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
