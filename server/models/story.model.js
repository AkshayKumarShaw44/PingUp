import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    media_urls: 
      {
        type: String,
      },
    views_count: [
      {
        type: String,
        ref: "User",
      },
    ],
    media_type: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    background_color: {
      type: String,
    },
  },{ timestamps: true, minimize: false  }
);

export const Story = mongoose.model("Story", storySchema);
