import express from "express";
import { followUser, getUserData, discoverUsers, unfollowUser, updateUserData, sendConnectionRequest, acceptConnectionRequest, getUserConnections, getUserProfiles } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../configs/multer.js";
import { getUserReceentMessages } from "../controllers/message.controller.js";
const userRouter = express.Router();

userRouter.get("/data", protect, getUserData);
userRouter.post("/update", upload.fields([{ name: "profile", maxCount: 1 }, { name: "cover", maxCount: 1 }]), protect, updateUserData);
userRouter.post("/discover", protect, discoverUsers);
userRouter.post("/follow", protect, followUser);
userRouter.post("/unfollow", protect, unfollowUser);
userRouter.post("/connect",protect,sendConnectionRequest)
userRouter.post("/accept",protect,acceptConnectionRequest)
userRouter.get('/connections',protect,getUserConnections)
userRouter.post('/profiles',getUserProfiles)
userRouter.get('/recent-messages',protect,getUserReceentMessages)

export default userRouter;
