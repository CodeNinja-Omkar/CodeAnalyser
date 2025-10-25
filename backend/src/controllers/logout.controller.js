//logout.controller.js
import logger from "../../logger.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const logoutHandler = asyncHandler(async (req, res) => {
  // Remove refresh token from database
  await User.findByIdAndUpdate(req.user.userId, {
    refreshToken: null,
  });

  // Clear cookies
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  logger.info(`User logged out: ${req.user.userId}`);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export { logoutHandler };
