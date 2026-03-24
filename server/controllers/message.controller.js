import fs from "fs";
import imageKit from "../configs/imagekit.js";
import { Message } from "../models/message.model.js";

// create an empty object to store ServerSide Event connections
const connections = {};

// controller func forSSE endpoint
export const sseController = (req, res) => {
  const { userId } = req.params;
  console.log(` New User ${userId} connected`);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  connections[userId] = res;

  res.write("data: Connected to SSE stream\n\n");
  req.on("close", () => {
    console.log(`User ${userId} disconnected`);
    delete connections[userId];
  });
};

//send message to specific user
export const sendMessage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;
    let media_url = "";
    let message_type = image ? "image" : "text";
    if (message_type === "image") {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imageKit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });
      media_url = imageKit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.json({ success: true, message });

    // send message to to_user_id using SSE

    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Chat messages

export const getChatMessages = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { to_user_id } = req.body;
    const message = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ created_at: -1 });
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true },
    );

    res.json({ success: true, message: error.message });
  } catch (error) {
    res.json({ success: false, message: error.message });
    
  }
};

export const getUserReceentMessages = async (req,res) => {
    try {
        const { userId } = await req.auth()
        const message = await Message.find({to_user_id: userId}.populate('from_user_id to_user_id')).sort({created_at : -1})
        res.json({success: true, message})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
