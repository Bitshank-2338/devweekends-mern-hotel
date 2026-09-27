const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const emailPattern = /^\S+@\S+\.\S+$/;

// The only user shape the API ever sends back. No password, not even hashed.
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // The client validates too, but the client can be bypassed, so the server
  // is the check that actually counts.
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // The plain password goes in; the pre-save hook on the model hashes it.
  const user = await User.create({ name: name.trim(), email, password });

  res.status(201).json({
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // password is select: false on the schema, so ask for it explicitly here.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // One message for both "no such email" and "wrong password". Telling them
  // apart would let someone probe which emails have an account.
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.status(200).json({
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

// GET /api/auth/me  (protected)
// Lets the frontend confirm a saved token is still valid after a refresh.
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
});

module.exports = { register, login, getMe };
