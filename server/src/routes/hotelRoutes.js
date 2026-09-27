const express = require('express');
const { getHotels, getHotelById } = require('../controllers/hotelController');

const router = express.Router();

// Browsing hotels is public. Only booking needs an account.
router.get('/', getHotels);
router.get('/:id', getHotelById);

module.exports = router;
