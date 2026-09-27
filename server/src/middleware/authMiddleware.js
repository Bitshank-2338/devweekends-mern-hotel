const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Guards every route it is mounted on. The request must carry a valid JWT in
// the Authorization header, otherwise it never reaches the controller.
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  // Expected shape: "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Throws if the signature does not match our secret or if it expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // The token may be valid but the account deleted since it was issued.
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    // Everything downstream reads the logged-in user from here.
    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Session expired, please log in again'
        : 'Not authorized, token is invalid';

    return res.status(401).json({ message });
  }
}

module.exports = protect;
