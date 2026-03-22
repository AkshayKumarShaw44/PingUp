import { err } from "inngest/types";
import {User} from "../models/user.model.js";

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const {userId} = req.auth;

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
        const {userId} = req.auth;
        const {username, location, bio, full_name} = req.body;
        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username);
        if(tempUser.username !== username){
            const user = User.findOne({username});
            if(user){
                username = tempUser.username;
            }
        }

        const updatedData = {
            username,
            location,
            bio,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]

    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}