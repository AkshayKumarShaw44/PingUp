import { User } from "../models/user.model.js";
import fs from "fs";
import imageKit from "../configs/imagekit.js";

// Get User Data using userId
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findById(userId).select(
      "-followers -following -connections -__v -createdAt -updatedAt",
    );
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update User Data using userId
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { username, full_name, bio, location } = req.body;
    const tempUser = await User.findById(userId);
    !username && (username = tempUser.username);

    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) {
        username = tempUser.username;
      }
    }

    const updatedData = { username, full_name, bio, location };
    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imageKit.upload({
        file: buffer,
        fileName: profile.originalname,
      })
      const url = imageKit.url({
        path: response.filePath,
        transformation: [
          {
            quality: "auto",
          },
          {
            format: "webp",
          },
          {
            width: '512',
          }
        ],
      });
      updatedData.profile_picture = url;
    }
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imageKit.upload({
        file: buffer,
        fileName: cover.originalname,
      })
      const url = imageKit.url({
        path: response.filePath,
        transformation: [
          {
            quality: "auto",
          },
          {
            format: "webp",
          },
          {
            width: '1280'
          }
        ],
      });
      updatedData.cover_photo = url;
    }
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select(
      "-followers -following -connections -__v -createdAt -updatedAt",
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get User Data using username, email, location or full_name
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { input } = req.body;
    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
      ],
    })
    const filteredUsers = allUsers.filter((user) => user._id !== userId);
    res.json({ success: true, data: filteredUsers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Follow User 
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.body;
    const user = await User.findById(userId);
    if (user.following.includes(id)) {
      return res.json({ success: false, message: "Already following the user" });
    }
    user.following.push(id);
    await user.save();
    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();
    res.json({ success: true, message: "User followed successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Unfollow User
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.body;
    const user = await User.findById(userId);
    user.following = user.following.filter(user => user !== id);
    await user.save();
    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter(user => user !== userId);
    await toUser.save();
    res.json({ success: true, message: "User unfollowed successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
