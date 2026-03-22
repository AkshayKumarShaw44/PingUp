import {User} from "../models/user.model.js";
import fs from "fs";
import imagekit from "../configs/imagekit.js";
import path from "path";

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const {userId} = await req.auth();

        const user = await User.findById(userId)
        // .select("-__v -createdAt -updatedAt");
        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
        return res.status(200).json({success: true, data: user})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

// Update User Data
export const updateUserData = async (req, res) => {
    try {
        const {userId} = await req.auth();
        let {username, location, bio, full_name} = req.body;
        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username);
        if(tempUser.username !== username){
            const user = await User.findOne({username});
            if(user){
                username = tempUser.username;
            }
        }

        // const updatedData = {
        //     username,
        //     location,
        //     bio,
        //     full_name
        // } 
        const updatedData = {
            username: username || tempUser.username,
            location: location || tempUser.location,
            bio: bio || tempUser.bio,
            full_name: full_name || tempUser.full_name
        };

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]

        if(profile){
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: "auto"},
                    {format: "webp"},
                    {width: "512"}
                ]
            })
            updatedData.profile_picture = url
        }
        if(cover){
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: "auto"},
                    {format: "webp"},
                    {width: "1280"}
                ]
            })
            updatedData.cover_photo = url
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, {new: true})

        res.json({success: true, data: user, message: "User data updated successfully"})

    } catch (error) {
        return res.status(503).json({success: false, message: error.message})
    }
}

// find user by name, username or email and location
export const discoverUsers = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    {username: new RegExp(input, "i")},
                    {email: new RegExp(input, "i")},
                    {full_name: new RegExp(input, "i")},
                    {location: new RegExp(input, "i")},
                ]
            }
        )
        const filteredUsers = allUsers.filter(user => user._id.toString() !== userId);
        // const filteredUsers = allUsers.filter(user => user._id. !== userId);
        res.json({success: true, data: filteredUsers})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

// Follow User 
export const followUser = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        if(user.following.includes(id)){
            return res.status(400).json({success: false, message: "Already following this user"})
        }
        
        user.following.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.json({success: true, message: "User followed successfully"})

    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        // user.following = user.following.filter(user => user !== id); 
        user.following = user.following.filter(followingId => followingId.toString() !== id);
        await user.save();

        const toUser = await User.findById(id);
        // toUser.followers = toUser.followers.filter(user => user !== userId);
        toUser.followers = toUser.followers.filter(followerId => followerId.toString() !== userId);
        await toUser.save();

        res.json({success: true, message: "User unfollowed successfully"})

    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

