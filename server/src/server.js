require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Render injects its own PORT, so read it from the environment and only fall
// back to 5000 for local development.
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

// Connect to MongoDB first, then start listening. If the database is
// unreachable there is no point in accepting requests.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`StaySphere API listening on port ${PORT}`);
  });
});
