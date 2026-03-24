import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../configs/multer.js";
import { getChatMessages, sendMessages, sseController } from "../controllers/message.controller.js";


const messageRouter = express.Router();

messageRouter.get("/:userId", sseController)
messageRouter.post("/send", upload.single('image'), protect, sendMessages)
messageRouter.post("/get", protect, getChatMessages)

export default messageRouter;

