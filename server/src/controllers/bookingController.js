const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../utils/asyncHandler');
const { validateStayDates } = require('../utils/dates');
const { getAvailableRooms } = require('../utils/availability');

function isPositiveWholeNumber(value) {
  return Number.isInteger(value) && value >= 1;
}

// Finds a booking that belongs to the logged-in user. Returns null for both
// "does not exist" and "belongs to someone else", so nobody can find out
// which booking ids exist for other users.
async function findOwnBooking(bookingId, userId) {
  if (!mongoose.isValidObjectId(bookingId)) return null;
  return Booking.findOne({ _id: bookingId, user: userId });
}

// POST /api/bookings  (protected)
const createBooking = asyncHandler(async (req, res) => {
  const { hotelId, roomName, checkIn, checkOut } = req.body;
  const guests = Number(req.body.guests);
  const rooms = Number(req.body.rooms);

  // 1. The hotel must exist.
  if (!hotelId || !mongoose.isValidObjectId(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel id' });
  }
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }

  // 2. The room type must belong to that hotel.
  const room = hotel.rooms.find((r) => r.name === roomName);
  if (!room) {
    return res.status(400).json({ message: 'This room type does not exist at this hotel' });
  }

  // 3. Dates must be real, not in the past, and check-out after check-in.
  const dates = validateStayDates(checkIn, checkOut);
  if (dates.error) {
    return res.status(400).json({ message: dates.error });
  }

  // 4. Guests must fit in the rooms requested.
  if (!isPositiveWholeNumber(guests)) {
    return res.status(400).json({ message: 'Guests must be at least 1' });
  }
  if (!isPositiveWholeNumber(rooms)) {
    return res.status(400).json({ message: 'Rooms must be at least 1' });
  }
  if (guests > room.capacity * rooms) {
    return res.status(400).json({
      message: `${rooms} ${room.name}${rooms > 1 ? 's' : ''} can host at most ${room.capacity * rooms} guests. Add more rooms or reduce guests.`,
    });
  }

  // 5. There must be enough free rooms for those dates.
  const availableRooms = await getAvailableRooms(hotel._id, room, dates.checkIn, dates.checkOut);
  if (rooms > availableRooms) {
    return res.status(409).json({
      message:
        availableRooms === 0
          ? `${room.name} is fully booked for these dates`
          : `Only ${availableRooms} ${room.name}${availableRooms > 1 ? 's are' : ' is'} left for these dates`,
      availableRooms,
    });
  }

  // 6. The server decides the price. Anything the browser sends about price
  //    is ignored, because it could have been edited.
  const totalPrice = dates.nights * rooms * room.pricePerNight;

  const booking = await Booking.create({
    user: req.user._id,
    hotel: hotel._id,
    hotelName: hotel.name,
    hotelCity: hotel.city,
    hotelImage: hotel.images[0],
    roomName: room.name,
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    nights: dates.nights,
    guests,
    rooms,
    pricePerNight: room.pricePerNight,
    totalPrice,
  });

  res.status(201).json({ booking });
});

// GET /api/bookings  (protected) - only the logged-in user's bookings
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ count: bookings.length, bookings });
});

// GET /api/bookings/:id  (protected, owner only)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await findOwnBooking(req.params.id, req.user._id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  res.status(200).json({ booking });
});

// PUT /api/bookings/:id/cancel  (protected, owner only)
// The booking is kept with status "cancelled" instead of being deleted, so
// the history stays intact. Cancelled bookings are ignored by the
// availability check, which frees the room again.
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await findOwnBooking(req.params.id, req.user._id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'This booking is already cancelled' });
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({ booking });
});

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
