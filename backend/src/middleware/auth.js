import jwt from "jsonwebtoken";
import { User } from "../config/db.js";

/**
 * Middleware to authenticate JWT token from Authorization header
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    const user = await User.findById(decoded.userId).select("-password_hash");
    if (!user) {
      return res.status(401).json({ message: "User not found, authorization denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message || error);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
