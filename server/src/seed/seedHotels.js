// Fills the database with fictional sample hotels.
// Run with: npm run seed
//
// Every hotel below is made up for this learning project. None of them are
// real businesses. Photos are generic travel/hotel shots from Unsplash.

require('dotenv').config();

const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

function photo(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;
}

const roomPhotos = {
  standard: [photo('1631049307264-da0ec9d70304'), photo('1595576508898-0ad5c879a061'), photo('1587985064135-0366536eab42')],
  deluxe: [photo('1618773928121-c32242e63f39'), photo('1582719478250-c89cae4dc85b'), photo('1590490360182-c33d57733427')],
  suite: [photo('1578683010236-d716f9a3f461'), photo('1602002418082-a4443e081dd1'), photo('1540518614846-7eded433c457')],
};

// Most hotels share the same three room types with different prices, so a
// small helper builds them. `n` just rotates through the room photos.
function standardRooms({ standard, deluxe, suite }, n) {
  return [
    {
      name: 'Standard Room',
      description: 'A comfortable room with a queen bed, work desk and a rain shower.',
      pricePerNight: standard,
      capacity: 2,
      totalRooms: 8,
      amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV'],
      image: roomPhotos.standard[n % 3],
    },
    {
      name: 'Deluxe Room',
      description: 'More space, a king bed, a sitting corner and a better view.',
      pricePerNight: deluxe,
      capacity: 3,
      totalRooms: 5,
      amenities: ['Wi-Fi', 'Air Conditioning', 'Mini Bar', 'Tea & Coffee Maker'],
      image: roomPhotos.deluxe[n % 3],
    },
    {
      name: 'Suite',
      description: 'A separate living room and bedroom, ideal for families or longer stays.',
      pricePerNight: suite,
      capacity: 4,
      totalRooms: 2,
      amenities: ['Wi-Fi', 'Air Conditioning', 'Bathtub', 'Living Area', 'Mini Bar'],
      image: roomPhotos.suite[n % 3],
    },
  ];
}

const hotels = [
  {
    name: 'Azure Bay Resort',
    city: 'Goa',
    address: 'Candolim Beach Road, North Goa, Goa 403515',
    description:
      'A relaxed beachfront resort a short walk from the sand. Spend the day by the lagoon pool, then watch the sunset from the open-air restaurant.',
    rating: 4.6,
    featured: true,
    amenities: ['Wi-Fi', 'Breakfast', 'Pool', 'Parking', 'Air Conditioning', 'Airport Transfer'],
    images: [photo('1566073771259-6a8506099945'), photo('1520250497591-112f2f40a3f4'), photo('1512100356356-de1b84283e18')],
    rooms: standardRooms({ standard: 5200, deluxe: 7400, suite: 12500 }, 0),
  },
  {
    name: 'Saltwind Beach House',
    city: 'Goa',
    address: 'Palolem Beach Lane, South Goa, Goa 403702',
    description:
      'A small, friendly guesthouse on a quiet southern beach. Simple rooms, hammocks in the garden and fresh seafood every evening.',
    rating: 4.2,
    featured: false,
    amenities: ['Wi-Fi', 'Breakfast', 'Air Conditioning'],
    images: [photo('1600011689032-8b628b8a8747'), photo('1551882547-ff40c63fe5fa'), photo('1602002418082-a4443e081dd1')],
    rooms: [
      {
        name: 'Garden Room',
        description: 'A cosy double room opening onto the palm garden.',
        pricePerNight: 3200,
        capacity: 2,
        totalRooms: 6,
        amenities: ['Wi-Fi', 'Fan', 'Garden View'],
        image: roomPhotos.standard[1],
      },
      {
        name: 'Sea View Room',
        description: 'Wake up to the sound of waves from your private balcony.',
        pricePerNight: 4800,
        capacity: 2,
        totalRooms: 3,
        amenities: ['Wi-Fi', 'Air Conditioning', 'Balcony', 'Sea View'],
        image: roomPhotos.suite[1],
      },
    ],
  },
  {
    name: 'Pinecrest Haven',
    city: 'Manali',
    address: 'Old Manali Road, Manali, Himachal Pradesh 175131',
    description:
      'A timber-and-stone mountain retreat surrounded by pine forest, with warm rooms, valley views and a fireplace lounge for cold evenings.',
    rating: 4.7,
    featured: true,
    amenities: ['Wi-Fi', 'Breakfast', 'Parking', 'Room Heater', 'Airport Transfer'],
    images: [photo('1596394516093-501ba68a0ba6'), photo('1445019980597-93fa8acb246c'), photo('1506905925346-21bda4d32df4')],
    rooms: standardRooms({ standard: 4200, deluxe: 6300, suite: 9800 }, 1),
  },
  {
    name: 'Amber Courtyard',
    city: 'Jaipur',
    address: 'Near Chandpol Gate, Jaipur, Rajasthan 302001',
    description:
      'A restored haveli-style hotel built around a sunlit courtyard, close to the old city bazaars and a short drive from the forts.',
    rating: 4.5,
    featured: true,
    amenities: ['Wi-Fi', 'Breakfast', 'Pool', 'Parking', 'Air Conditioning'],
    images: [photo('1455587734955-081b22074882'), photo('1625244724120-1fd1d34d00f6'), photo('1599661046289-e31897846e41')],
    rooms: standardRooms({ standard: 3800, deluxe: 5600, suite: 9500 }, 2),
  },
  {
    name: 'Harbor View Suites',
    city: 'Mumbai',
    address: 'Marine Lines, South Mumbai, Maharashtra 400020',
    description:
      'A modern city hotel near the seafront promenade, a good base for business trips and weekend city breaks alike.',
    rating: 4.4,
    featured: false,
    amenities: ['Wi-Fi', 'Breakfast', 'Gym', 'Air Conditioning', 'Airport Transfer'],
    images: [photo('1542314831-068cd1dbfeeb'), photo('1567157577867-05ccb1388e66'), photo('1564501049412-61c2a3083791')],
    rooms: standardRooms({ standard: 6800, deluxe: 9200, suite: 15500 }, 0),
  },
  {
    name: 'Lakewood Palace',
    city: 'Udaipur',
    address: 'Lake Pichola Road, Udaipur, Rajasthan 313001',
    description:
      'A heritage-style lakeside hotel with rooftop dining, arched balconies and boat rides at sunset.',
    rating: 4.8,
    featured: true,
    amenities: ['Wi-Fi', 'Breakfast', 'Pool', 'Parking', 'Air Conditioning', 'Airport Transfer'],
    images: [photo('1561501900-3701fa6a0864'), photo('1584132967334-10e028bd69f7'), photo('1439066615861-d1af74d74000')],
    rooms: standardRooms({ standard: 6500, deluxe: 9500, suite: 16000 }, 1),
  },
  {
    name: 'Coconut Grove Retreat',
    city: 'Kochi',
    address: 'Fort Kochi Beach Road, Kochi, Kerala 682001',
    description:
      'A calm retreat among coconut palms, with Kerala breakfasts, an outdoor pool and easy trips to the backwaters.',
    rating: 4.3,
    featured: false,
    amenities: ['Wi-Fi', 'Breakfast', 'Pool', 'Air Conditioning', 'Parking'],
    images: [photo('1540541338287-41700207dee6'), photo('1593693397690-362cb9666fc2'), photo('1522798514-97ceb8c4f1c8')],
    rooms: standardRooms({ standard: 4000, deluxe: 5800, suite: 9000 }, 2),
  },
  {
    name: 'Metro Nest',
    city: 'Bengaluru',
    address: 'Indiranagar 100 Feet Road, Bengaluru, Karnataka 560038',
    description:
      'A smart, compact hotel in a lively neighbourhood full of cafes. Fast Wi-Fi and a 24-hour gym make it popular with work travellers.',
    rating: 4.1,
    featured: false,
    amenities: ['Wi-Fi', 'Breakfast', 'Gym', 'Air Conditioning'],
    images: [photo('1560347876-aeef00ee58a1'), photo('1571896349842-33c89424de2d'), photo('1558211583-d26f610c1eb1')],
    rooms: [
      {
        name: 'Studio Room',
        description: 'A compact room with a queen bed and a proper work desk.',
        pricePerNight: 3600,
        capacity: 2,
        totalRooms: 10,
        amenities: ['Wi-Fi', 'Air Conditioning', 'Work Desk'],
        image: roomPhotos.standard[2],
      },
      {
        name: 'Executive Room',
        description: 'A larger room with a lounge chair, bathtub and city views.',
        pricePerNight: 5400,
        capacity: 3,
        totalRooms: 4,
        amenities: ['Wi-Fi', 'Air Conditioning', 'Bathtub', 'City View'],
        image: roomPhotos.deluxe[2],
      },
    ],
  },
  {
    name: 'Cloud Valley Lodge',
    city: 'Shillong',
    address: 'Laitumkhrah, Shillong, Meghalaya 793003',
    description:
      'A quiet hillside lodge with pine-framed balconies, local Khasi cuisine and day trips to waterfalls and living root bridges.',
    rating: 4.5,
    featured: true,
    amenities: ['Wi-Fi', 'Breakfast', 'Parking', 'Room Heater'],
    images: [photo('1615880484746-a134be9a6ecf'), photo('1609920658906-8223bd289001'), photo('1464822759023-fed622ff2c3b')],
    rooms: standardRooms({ standard: 3500, deluxe: 5200, suite: 8200 }, 0),
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Copy .env.example to .env first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Bookings point at hotel ids, and those ids change on every seed, so old
  // bookings would be orphaned. Clear both. Users are left alone.
  await Booking.deleteMany({});
  await Hotel.deleteMany({});
  const created = await Hotel.insertMany(hotels);

  console.log(`Seeded ${created.length} hotels`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(`Seeding failed: ${error.message}`);
  process.exit(1);
});
