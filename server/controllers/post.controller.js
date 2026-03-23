import fs from "fs";
import imageKit from "../configs/imagekit.js";
import {Post} from "../models/post.model.js";
import { User } from "../models/user.model.js";

export const addPost = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {content, post_type} = req.body;
        const images = req.files

        let image_urls = [];

        if(images.length > 0){
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path);
                    const response = await imageKit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: "post"
                    })
                    const url = imageKit.url({
                        path: response.filePath,
                        transformation: [
                            {quality: "auto"},
                            {format: "webp"},
                            {width: '1280'}
                        ]
                    })
                    return url;
                })
            )

        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        res.json({success: true, message: "Post created successfully"});
        
    } catch (error) {
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

//get posts

export const getFeedPosts = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const user = await User.findById(userId);
    } catch (error) {
        
    }
}