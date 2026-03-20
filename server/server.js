import 'dotenv/config'; // <--- THIS MUST BE LINE 1
import express from "express";
import cors from "cors";
import { connectDB } from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import userRouter from "./routes/user.route.js";


const app = express();

connectDB()

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));


const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/api/inngest", serve({client: inngest, functions}));
app.use('/api/user',userRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
