import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import { User } from "../config/db.js" // Import Mongoose User model

const router = Router()

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("nativeLanguage").notEmpty().withMessage("Native language is required"),
    body("learningLanguages").isArray().withMessage("Learning languages must be an array"),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, username, password, nativeLanguage, learningLanguages } = req.body

    try {
      let user = await User.findOne({ $or: [{ email }, { username }] })
      if (user) {
        return res.status(400).json({ message: "User with that email or username already exists" })
      }

      const salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash(password, salt)

      user = new User({
        email,
        username,
        password_hash,
        native_language: nativeLanguage,
        learning_languages: learningLanguages,
        theme: "light", // Default theme
        is_online: false,
        last_seen: new Date(),
      })

      await user.save()

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables.")
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url,
          native_language: user.native_language,
          learning_languages: user.learning_languages,
          theme: user.theme,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error during signup" })
    }
  },
)

// @route   POST /api/auth/signin
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables.")
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

      // Update user online status and last seen
      user.is_online = true
      user.last_seen = new Date()
      await user.save()

      res.json({
        message: "Signed in successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url,
          native_language: user.native_language,
          learning_languages: user.learning_languages,
          theme: user.theme,
          is_online: user.is_online,
          last_seen: user.last_seen,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error during signin" })
    }
  },
)

// @route   POST /api/auth/signout
// @desc    Sign out user (invalidate token on client-side)
// @access  Private (handled by client removing token)
router.post("/signout", async (req, res) => {
  // In a token-based system, signout is primarily a client-side action
  // where the client discards the token.
  // However, we can update the user's online status here.
  try {
    // Assuming authenticateToken middleware has attached user to req
    const userId = req.user._id
    const user = await User.findById(userId)
    if (user) {
      user.is_online = false
      user.last_seen = new Date()
      await user.save()
    }
    res.json({ message: "Signed out successfully" })
  } catch (error) {
    console.error("Error during signout:", error)
    res.status(500).json({ message: "Server error during signout" })
  }
})

export default router
