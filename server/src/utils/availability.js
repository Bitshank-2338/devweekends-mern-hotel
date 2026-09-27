const Booking = require('../models/Booking');

// How many rooms of one type are already taken for the requested dates.
//
// Two stays overlap when the existing one starts before the new one ends
// AND ends after the new one starts:
//
//   existing.checkIn < requested.checkOut  AND  existing.checkOut > requested.checkIn
//
// Checking out on the same day someone else checks in is NOT an overlap,
// because the room is free again by then.
async function countBookedRooms(hotelId, roomName, checkIn, checkOut) {
  const overlappingBookings = await Booking.find({
    hotel: hotelId,
    roomName,
    status: 'confirmed',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  }).select('rooms');

  // One booking can hold several rooms, so add up rooms, not bookings.
  return overlappingBookings.reduce((total, booking) => total + booking.rooms, 0);
}

async function getAvailableRooms(hotelId, room, checkIn, checkOut) {
  const bookedRooms = await countBookedRooms(hotelId, room.name, checkIn, checkOut);
  return Math.max(room.totalRooms - bookedRooms, 0);
}

module.exports = { countBookedRooms, getAvailableRooms };
