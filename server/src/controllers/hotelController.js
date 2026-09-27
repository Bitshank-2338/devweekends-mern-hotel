const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../utils/asyncHandler');
const { validateStayDates } = require('../utils/dates');
const { getAvailableRooms } = require('../utils/availability');

// "Goa" should match "goa" and "GOA", and a search for "a.b" must not be
// treated as a regex pattern, so escape special characters first.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The cheapest room decides the "from ₹X/night" price on a hotel card.
function startingPrice(hotel) {
  return Math.min(...hotel.rooms.map((room) => room.pricePerNight));
}

// A hotel can host a group if at least one room type has enough beds in
// total (capacity per room × number of rooms of that type).
function canHostGuests(hotel, guests) {
  return hotel.rooms.some((room) => room.capacity * room.totalRooms >= guests);
}

// GET /api/hotels?city=Goa&guests=2&minPrice=3000&maxPrice=9000&rating=4&sort=price-low&featured=true
const getHotels = asyncHandler(async (req, res) => {
  const { city, guests, minPrice, maxPrice, rating, sort, featured } = req.query;

  // Filters that MongoDB can apply directly.
  const filter = {};
  if (city && city.trim()) {
    filter.city = { $regex: `^${escapeRegex(city.trim())}$`, $options: 'i' };
  }
  if (rating && Number(rating) > 0) {
    filter.rating = { $gte: Number(rating) };
  }
  if (featured === 'true') {
    filter.featured = true;
  }

  const hotels = await Hotel.find(filter).lean();

  // Filters based on the rooms inside each hotel are easier to read in plain
  // JavaScript, and the collection is small enough for that to be fine.
  const guestCount = Number(guests) || 1;
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || Infinity;

  let results = hotels
    .filter((hotel) => hotel.rooms.length > 0)
    .map((hotel) => ({ ...hotel, startingPrice: startingPrice(hotel) }))
    .filter((hotel) => canHostGuests(hotel, guestCount))
    .filter((hotel) => hotel.startingPrice >= min && hotel.startingPrice <= max);

  if (sort === 'price-low') {
    results.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (sort === 'price-high') {
    results.sort((a, b) => b.startingPrice - a.startingPrice);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else {
    // "Recommended": featured hotels first, then the best rated.
    results.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }

  res.status(200).json({ count: results.length, hotels: results });
});

// GET /api/hotels/:id?checkIn=2026-10-10&checkOut=2026-10-13
// When dates are given, every room also reports how many are still free.
const getHotelById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid hotel id' });
  }

  const hotel = await Hotel.findById(id).lean();
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }

  const { checkIn, checkOut } = req.query;
  if (checkIn && checkOut) {
    const dates = validateStayDates(checkIn, checkOut);
    if (dates.error) {
      return res.status(400).json({ message: dates.error });
    }

    // One small query per room type (usually three), run in parallel.
    hotel.rooms = await Promise.all(
      hotel.rooms.map(async (room) => ({
        ...room,
        availableRooms: await getAvailableRooms(hotel._id, room, dates.checkIn, dates.checkOut),
      }))
    );
  }

  res.status(200).json({ hotel });
});

module.exports = { getHotels, getHotelById };
