import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    bio: {
      type: String,
      default: "Hey there! I am using pingup.",
      maxLength: 500,
    },
    profile_picture: {
      type: String,
      default: "",
    },
    cover_photo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: String, // Change from ObjectId to String
        ref: "User",
      },
    ],
    following: [
      {
        type: String, // Change from ObjectId to String
        ref: "User",
      },
    ],
    connections: [
      {
        type: String, // Change from ObjectId to String
        ref: "User",
      },
    ],
  },
  { timestamps: true, minimize: false },
);

// Add this before the export
// userSchema.index({ username: "text", full_name: "text", location: "text" });

export const User = mongoose.model("User", userSchema);