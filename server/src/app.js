const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// The React app runs on a different origin (another port locally, another
// domain in production), so the browser needs this API to say which origin
// is allowed to call it.
app.use(cors({ origin: process.env.CLIENT_URL }));

// Parses JSON request bodies into req.body
app.use(express.json());

// A plain health check, handy after deploying to confirm the API is awake.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'StaySphere API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Reached only when no route above matched the request.
app.use(notFound);

// Reached whenever a route or middleware passed an error to next().
app.use(errorHandler);

module.exports = app;
