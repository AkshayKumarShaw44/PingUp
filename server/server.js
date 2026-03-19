import express from 'express'
import cors from 'cors'
import dotenv from "dotenv";
import { connectDB } from './configs/db.js';
// Load environment variables from .env file into process.env
dotenv.config();

import { inngest, functions } from './inngest/index.js';
import {serve} from 'inngest/express'
import { clerkMiddleware } from '@clerk/express'


const PORT = process.env.PORT || 4000

const app = express()
connectDB()

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.get('/',(req,res)=>res.send('Server is running'))
app.use('/api/inngest',serve({client: inngest, functions: functions}))
app.listen(PORT,()=>{
    console.log(`Server is running on number: ${PORT}`)
})

