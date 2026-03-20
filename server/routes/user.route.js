import express from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { discoverUsers, getUserData, updateUserData, followUser, unfollowUser } from "../controllers/user.controller.js"
import { upload } from "../configs/multer.js"
import { requireAuth } from '@clerk/express'
const userRouter = express.Router()

userRouter.get('/data',requireAuth() , getUserData)
userRouter.post('/update',requireAuth(), upload.fields([{ name: "profile", maxCount: 1 }, { name: "cover", maxCount: 1 }]), updateUserData)
userRouter.post('/discover', requireAuth(), discoverUsers)
userRouter.post('/follow', requireAuth(), followUser)
userRouter.post('/unfollow', requireAuth(), unfollowUser)

export default userRouter