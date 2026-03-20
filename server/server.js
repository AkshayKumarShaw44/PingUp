import express from "express";
import cors from "cors";
import 'dotenv/config'; 
import { connect } from "mongoose";
import { connectDB } from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

const app = express();

connectDB()

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/api/inngest", serve({client: inngest, functions}));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
