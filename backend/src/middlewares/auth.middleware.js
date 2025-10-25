//auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Access token required");
  }

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Attach user to request
    req.user = { userId: decoded.userId };
    return next();
  } catch (err) {
    // Access token expired or invalid
    if (err.name !== "TokenExpiredError") {
      throw new ApiError(401, "Invalid access token");
    }

    // Try to refresh using refresh token
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    try {
      // Verify refresh token
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_REFRESH
      );

      // Get user and verify stored refresh token
      const user = await User.findById(decodedRefresh.userId).select(
        "+refreshToken +refreshTokenVersion"
      );

      if (!user) {
        throw new ApiError(401, "User not found");
      }

      // Verify refresh token matches stored hash
      const hashedToken = user.hashRefreshToken(refreshToken);
      if (hashedToken !== user.refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Check token version (invalidates all tokens on password change)
      if (decodedRefresh.version !== user.refreshTokenVersion) {
        throw new ApiError(401, "Token version mismatch");
      }

      // Generate new tokens
      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Hash and store new refresh token
      const hashedRefreshToken = user.hashRefreshToken(newRefreshToken);
      await User.findByIdAndUpdate(user._id, {
        refreshToken: hashedRefreshToken,
      });

      // Cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      };

      // Set new cookies
      res.cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.user = { userId: decodedRefresh.userId };
      next();
    } catch (refreshErr) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }
});

export { verifyJwt };
