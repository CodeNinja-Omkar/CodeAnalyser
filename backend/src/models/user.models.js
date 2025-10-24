import mongoose from "mongoose";

const user = mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
},{ timestamps: true });

export const User = mongoose.model("users",user);