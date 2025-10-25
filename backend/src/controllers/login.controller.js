//login.controller.js
import logger from "../../logger.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

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
    secure: process.env.NODE_ENV === "production",
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

  logger.info(`User logged in: ${user.email}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      },
      "Login successful"
    )
  );
});

export { loginHandler };
