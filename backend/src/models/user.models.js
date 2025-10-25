//user.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../../logger.js";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters"],
    },
    refreshToken: {
      type: String,
      select: false, // Don't return refresh token by default
    },
    refreshTokenVersion: {
      type: Number,
      default: 0, // For invalidating all tokens on password change
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const saltRounds = 12; // Increased from 10 for better security
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      version: this.refreshTokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Reduced from 1h for better security
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      version: this.refreshTokenVersion,
    },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: "7d" } // Changed to 7 days
  );
};

// Hash refresh token before storing
userSchema.methods.hashRefreshToken = function (token) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Static method for registration
userSchema.statics.registerUser = async function (email, username, password) {
  // Check if user already exists
  const existingUser = await this.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email already registered");
    }
    if (existingUser.username === username) {
      throw new Error("Username already taken");
    }
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await this.create({
    email,
    username,
    password,
  });

  logger.info(`User registered: ${user.email}`);
  return user;
};

export const User = mongoose.model("users", userSchema);
