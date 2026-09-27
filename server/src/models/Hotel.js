const mongoose = require('mongoose');

// Rooms live inside the hotel document instead of their own collection.
// A hotel only has a handful of room types, and they are always shown with
// the hotel, so embedding keeps reads to a single query.
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  // How many guests fit in ONE room of this type.
  capacity: { type: Number, required: true, min: 1 },
  // How many rooms of this type the hotel has in total.
  totalRooms: { type: Number, required: true, min: 1 },
  amenities: [String],
  image: String,
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    address: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    images: [String],
    amenities: [String],
    featured: { type: Boolean, default: false },
    rooms: [roomSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotelSchema);
