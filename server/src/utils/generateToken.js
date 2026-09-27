const jwt = require('jsonwebtoken');

// Signs a JWT for a user. The payload holds only the user id: anyone can read
// a JWT payload, so nothing private belongs in it.
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = generateToken;
