import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    image_urls: [
      {
        type: String,
      },
    ],
    likes_count: [
      {
        type: String,
        ref: "User",
      },
    ],
    post_type: {
      type: String,
      enum: ["text", "image", "text_with_image"],
      required: true,
    },
  },{ timestamps: true, minimize: false  }
);

export const Post = mongoose.model("Post", postSchema);
