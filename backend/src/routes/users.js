import { Router } from "express"
import { User } from "../config/db.js" // Import Mongoose User model

const router = Router()

// @route   GET /api/users/me
// @desc    Get authenticated user's profile
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password_hash") // Exclude password hash
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/users/me
// @desc    Update authenticated user's profile
// @access  Private
router.put("/me", async (req, res) => {
  const { username, avatar_url, native_language, learning_languages, theme } = req.body

  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (username) user.username = username
    if (avatar_url) user.avatar_url = avatar_url
    if (native_language) user.native_language = native_language
    if (learning_languages) user.learning_languages = learning_languages
    if (theme) user.theme = theme

    await user.save()
    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/users/search
// @desc    Search for users by username or email
// @access  Private
router.get("/search", async (req, res) => {
  const { q } = req.query

  if (!q) {
    return res.status(400).json({ message: "Search query 'q' is required" })
  }

  try {
    const users = await User.find({
      $or: [{ username: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }],
    }).select("username avatar_url is_online") // Select relevant fields

    res.json(users)
  } catch (error) {
    console.error("Error searching users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
