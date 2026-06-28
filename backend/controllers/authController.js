const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const user = await User.create({ fullName, email: email.toLowerCase(), password })

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages[0] })
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        company: user.company,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed. Please try again.' })
  }
}

exports.getMe = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.' })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, company, role } = req.body
    const updates = {}
    if (fullName) updates.fullName = fullName
    if (company !== undefined) updates.company = company
    if (role !== undefined) updates.role = role

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true })
    res.json({ user, message: 'Profile updated successfully.' })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ message: 'Failed to update profile.' })
  }
}
