import fs from "fs";
import imageKit from "../configs/imagekit.js";
import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";
import { inngest } from "../inngest/index.js";

export const addUserStory = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file
        let media_urls = "";

        if(media_type === 'image' || media_type === 'video'){
            const fileBuffer = fs.readFileSync(media.path);
            const response = await imageKit.upload({
                file: fileBuffer,
                fileName: media.originalname,
                folder: "story",
            });
            media_urls = response.url
        }

        const story = await Story.create({
            user: userId,
            content,
            media_urls,
            media_type,
            background_color
        });

        await inngest.send({
            name: "app/story.delete",
            data: { storyId: story._id }
        })

        return res.status(201).json({ success: true, data: story });
    } catch (error) {
        
    }
}

//get stories
export const getUserStories = async (req, res) => {
    try {           
        const { userId } = await req.auth();
        const user = await User.findById(userId)
        const userIds = [userId, ...user.connections, ...user.following];
        const stories = await Story.find({ 
            user: { $in: userIds }
         }).populate("user").sort({ createdAt: -1 });
        return res.status(200).json({ success: true,stories });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}       