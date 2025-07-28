import jwt from "jsonwebtoken"
import { User } from "../config/db.js"

export const authenticateToken = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" })
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user from DB to the request
    req.user = await User.findById(decoded.userId).select("-password_hash")
    if (!req.user) {
      return res.status(401).json({ message: "User not found, authorization denied" })
    }
    next()
  } catch (error) {
    console.error("Token verification failed:", error)
    res.status(401).json({ message: "Token is not valid" })
  }
}
