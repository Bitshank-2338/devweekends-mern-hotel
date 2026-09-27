const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },

    // Copies of the hotel details at booking time. If the hotel is renamed or
    // a price changes later, old bookings still show what the guest booked.
    hotelName: { type: String, required: true },
    hotelCity: { type: String, required: true },
    hotelImage: String,

    roomName: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    guests: { type: Number, required: true, min: 1 },
    rooms: { type: Number, required: true, min: 1 },
    pricePerNight: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// The availability check always filters by these fields, so index them.
bookingSchema.index({ hotel: 1, roomName: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
