import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { addUserStory, getUserStories } from "../controllers/story.controller.js";
import { upload } from "../configs/multer.js";

const storyRouter = express.Router();

storyRouter.post("/create",upload.single("media"),protect, addUserStory)
storyRouter.get("/get", protect, getUserStories)

export default storyRouter;

