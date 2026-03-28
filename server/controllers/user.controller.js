import {User} from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import fs from "fs";
import imagekit from "../configs/imagekit.js";
import path from "path";
import { Connection } from "../models/connection.model.js";
import { inngest } from "../inngest/index.js";

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const {userId} = await req.auth();

        const user = await User.findById(userId)
        // .select("-__v -createdAt -updatedAt");
        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
        return res.status(200).json({success: true, user})
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
        res.json({success: true, users: filteredUsers})
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

        const targetId = id && id.toString()
        if (!targetId) return res.status(400).json({ success: false, message: 'id required' })

        // avoid duplicates by comparing stringified ids
        if (user.following && user.following.some(f => f.toString() === targetId)) {
            return res.status(400).json({ success: false, message: "Already following this user" })
        }

        user.following = user.following || []
        user.following.push(targetId);
        // ensure uniqueness
        user.following = Array.from(new Set(user.following.map(x => x.toString())));
        await user.save();

        const toUser = await User.findById(targetId);
        toUser.followers = toUser.followers || []
        toUser.followers.push(userId.toString());
        toUser.followers = Array.from(new Set(toUser.followers.map(x => x.toString())));
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

        user.following = (user.following || []).filter(followingId => followingId.toString() !== id.toString());
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers = (toUser.followers || []).filter(followerId => followerId.toString() !== userId.toString());
        await toUser.save();

        res.json({success: true, message: "User unfollowed successfully"})

    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

// Send Connection Request
export const sendConnectionRequest = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const { id } = req.body;

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find({from_user_id: userId, created_at: {$gt: last24Hours}})
        if(connectionRequests.length >= 20){
            return res.json({success: false, message: "You can only send 20 connection requests in 24 hours"})
        }

        const connection = await Connection.findOne({
            $or: [
                {from_user_id: userId, to_user_id: id},
                {from_user_id: id, to_user_id: userId}
            ]
        })

        if(!connection){
            const newConnection = await Connection.create({from_user_id: userId, to_user_id: id}) 

            await inngest.send({
                name: "app/connection-request",
                data: {
                    connectionId: newConnection._id
                }
            })

            return res.json({success: true, message: "Connection request sent successfully"})
        }
        else if(connection && connection.status === "accepted"){
            return res.json({success: false, message: "You are already connected with this user"})
        }

        res.json({success: false, message: "you have already sent a connection request to this user"})

    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

//get user connections

export const getUserConnections = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const user = await User.findById(userId)
            .populate("connections")
            .populate("followers")
            .populate("following");

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({to_user_id: userId, status: "pending"}).populate("from_user_id")).map(connection => connection.from_user_id )

        res.json({success: true, connections, followers, following, pendingConnections})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

// Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        const connection = await Connection.findOne({from_user_id: id, to_user_id: userId})

        if(!connection){
            return res.status(404).json({success: false, message: "Connection request not found"})
        }

    const user = await User.findById(userId);
    user.connections = user.connections || []
    if (!user.connections.some(c => c.toString() === id.toString())) user.connections.push(id.toString())
    user.connections = Array.from(new Set(user.connections.map(x => x.toString())))
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections = toUser.connections || []
    if (!toUser.connections.some(c => c.toString() === userId.toString())) toUser.connections.push(userId.toString())
    toUser.connections = Array.from(new Set(toUser.connections.map(x => x.toString())))
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

        res.json({success: true, message: "Connection request accepted successfully"})
        
    } catch (error) {
        return res.status(500).json({success: false, message: error.message+"cvbgf"})
    }
}

// Disconnect / remove connection between users
export const disconnectConnection = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body; // id of the other user

        if (!id) return res.status(400).json({ success: false, message: 'id required' })

        const user = await User.findById(userId);
        const other = await User.findById(id);
        if (!user || !other) return res.status(404).json({ success: false, message: 'User not found' })

        // remove each other from connections arrays
        user.connections = user.connections.filter(c => c.toString() !== id)
        other.connections = other.connections.filter(c => c.toString() !== userId)
        await user.save()
        await other.save()

        // remove Connection docs with accepted status between the users
        await Connection.deleteMany({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ],
            status: 'accepted'
        })

        res.json({ success: true, message: 'Disconnected successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


// Get User profile 
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body
        // determine requester if token present
        let requesterId = null
        try {
            const auth = await req.auth()
            requesterId = auth.userId
        } catch (e) {
            requesterId = null
        }

        // populate followers and following so client can render lists without extra requests
        const profile = await User.findById(profileId)
            .populate('followers', 'full_name username profile_picture bio')
            .populate('following', 'full_name username profile_picture bio')
        if(!profile){
            return res.status(404).json({success: false, message: "Profile not found"})
        }

        const posts = await Post.find({user: profileId}).populate('user')

        // compute connection flags relative to requester
        let isConnected = false
        let pendingOutgoing = false
        let pendingIncoming = false
        if (requesterId) {
            // check connections array
            isConnected = Array.isArray(profile.connections) && profile.connections.some(c => c.toString() === requesterId.toString())

            const connOut = await Connection.findOne({ from_user_id: requesterId, to_user_id: profileId })
            const connIn = await Connection.findOne({ from_user_id: profileId, to_user_id: requesterId })
            if (connOut && connOut.status === 'pending') pendingOutgoing = true
            if (connIn && connIn.status === 'pending') pendingIncoming = true
        }

        res.status(200).json({success: true, profile, posts, isConnected, pendingOutgoing, pendingIncoming})
        
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}