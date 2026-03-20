import express from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { discoverUsers, getUserData, updateUserData, followUser, unfollowUser } from "../controllers/user.controller.js"
import { upload } from "../configs/multer.js"
import { requireAuth } from '@clerk/express'
const userRouter = express.Router()

userRouter.get('/data',requireAuth() ,protect, getUserData)
userRouter.post('/update', upload.fields([{ name: "profile", maxCount: 1 }, { name: "cover", maxCount: 1 }]), protect, updateUserData)
userRouter.post('/discover', protect, discoverUsers)
userRouter.post('/follow', protect, followUser)
userRouter.post('/unfollow', protect, unfollowUser)

export default userRouter