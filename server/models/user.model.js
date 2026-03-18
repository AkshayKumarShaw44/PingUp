import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id : {
    type: String,
    required: true,
  },
  email : {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  full_name : {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  username : {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  bio : {
    type: String,
    default: 'Hey there! I am using pingup.',
    maxLength: 500
  },
  profile_picture: {
    type: String,
    default: ''
  },
  cover_photo : {
    type : String,
    default: ''
  },
  location : {
    type : String,
    default: ''
  },
  followers : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  connections : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

}, { timestamps: true, minimize: false });

export const User = mongoose.model('User', userSchema);