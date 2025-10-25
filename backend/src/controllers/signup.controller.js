//signup.controller.js
import logger from "../../logger.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signUpHandler = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Input validation
  if (!email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  // Register user
  const user = await User.registerUser(email, username, password);

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Hash and store refresh token
  const hashedRefreshToken = user.hashRefreshToken(refreshToken);
  await User.findByIdAndUpdate(user._id, {
    refreshToken: hashedRefreshToken,
  });

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",
  };

  // Set cookies
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info(`User logged in successfully: ${user.email}`);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      },
      "User registered successfully"
    )
  );
});

export { signUpHandler };
