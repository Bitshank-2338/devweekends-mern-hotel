# StaySphere — MERN Hotel Booking App

> Find a stay that fits your journey.

**Live demo:** _coming soon_  
**API:** _coming soon_

## About

StaySphere is a full-stack hotel booking app built to practise the MERN stack (MongoDB, Express, React, Node) as part of the Dev Weekends Fellowship.

Visitors can search hotels by destination, dates and guests, filter and sort the results, compare room types, and — after creating an account — book rooms, see their bookings and cancel them. The server checks room availability for the chosen dates so the same room can never be booked twice.

All hotels are fictional. No payments are taken.

## Features

- Hotel search by destination, dates and number of guests
- Filter by price and rating, sort by price or rating
- Hotel details with photo gallery, amenities and room types
- Live "rooms left" for the selected dates
- Registration and login with hashed passwords
- JWT authentication (7-day token, sent as a Bearer header)
- Server-side availability check that prevents overbooking
- Booking creation with the price calculated on the server
- Booking history (only your own bookings)
- Cancellation that keeps the booking in history and frees the room
- Session kept across refreshes, expired sessions handled cleanly
- Responsive layout from 375px phones to large desktops

## Tech stack

**Frontend:** React 18, Vite, React Router, Fetch API, plain CSS

**Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (jsonwebtoken), bcryptjs, dotenv, cors

## Architecture

```text
React (Vite)          pages, components, form validation
   ↓
Fetch API             client/src/api/api.js adds the JWT and handles errors
   ↓
Express               routes → auth middleware → controllers
   ↓
Mongoose              User, Hotel (with embedded rooms), Booking models
   ↓
MongoDB               users, hotels, bookings collections
```

```text
devweekends-mern-hotel/
├── client/
│   ├── src/
│   │   ├── api/api.js              one place for every fetch call
│   │   ├── components/             Navbar, SearchBar, HotelCard, HotelFilters,
│   │   │                           RoomCard, BookingSummary, LoadingState,
│   │   │                           ErrorMessage, ProtectedRoute, Footer
│   │   ├── pages/                  Home, Hotels, HotelDetails, Login,
│   │   │                           Register, MyBookings, NotFound
│   │   ├── utils/format.js         price/date helpers + date validation
│   │   ├── App.jsx                 routes and login state
│   │   └── index.css
│   ├── vercel.json                 sends every URL to index.html (SPA)
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/            auth, hotel, booking
│   │   ├── middleware/             auth (JWT), error, not found
│   │   ├── models/                 User, Hotel, Booking
│   │   ├── routes/
│   │   ├── seed/seedHotels.js      9 fictional hotels
│   │   ├── utils/                  generateToken, asyncHandler,
│   │   │                           dates, availability
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
└── README.md
```

## Booking flow

```text
Search hotel
→ choose hotel
→ choose room
→ login (the selected room and dates are kept in the URL)
→ submit booking
→ server checks availability
→ server calculates total
→ MongoDB saves booking
→ frontend shows confirmation
```

In more detail, `POST /api/bookings` does this, in order:

1. Checks the hotel exists
2. Checks the room type belongs to that hotel
3. Checks the dates (real dates, not in the past, check-out after check-in)
4. Checks the guests fit: `guests ≤ room.capacity × rooms`
5. Counts the nights
6. Checks enough rooms are free for those dates
7. Calculates `total = nights × rooms × pricePerNight`
8. Saves the booking with the logged-in user's id

The browser never sends a price. Even if someone edits the request, the server uses its own price from the database.

## Availability logic

Each room type has a `totalRooms` count (e.g. 2 Suites). A booking takes some of those rooms for some nights.

Two stays **overlap** when one starts before the other ends, **and** ends after the other starts:

```text
existing.checkIn < requested.checkOut
AND
existing.checkOut > requested.checkIn
```

```text
Existing:    |----- 10 Oct → 13 Oct -----|
Requested:              |--- 12 Oct → 14 Oct ---|     overlaps (12 < 13 and 14 > 10)
Requested:                                |--- 13 Oct → 15 Oct ---|   no overlap (13 < 13 is false)
```

Checking out on the same day someone else checks in is fine: the room is free again by then.

So, for a hotel + room type + date range:

```text
bookedRooms    = sum of `rooms` in all CONFIRMED bookings that overlap
availableRooms = room.totalRooms - bookedRooms
reject if requestedRooms > availableRooms   (409 Conflict)
```

Cancelled bookings are ignored, so cancelling frees the room straight away. The code lives in [`server/src/utils/availability.js`](server/src/utils/availability.js).

**Known limitation:** two requests arriving at the exact same millisecond could both pass the check before either is saved. A production system would use a database transaction or a per-night inventory document; that is left out here to keep the logic easy to follow.

## API endpoints

| Method | Endpoint                     | Auth | Description                                   |
| ------ | ---------------------------- | ---- | --------------------------------------------- |
| POST   | `/api/auth/register`         | –    | Create an account, returns `{ user, token }`  |
| POST   | `/api/auth/login`            | –    | Log in, returns `{ user, token }`             |
| GET    | `/api/auth/me`               | JWT  | Current user (used to validate a saved token) |
| GET    | `/api/hotels`                | –    | List/search hotels                            |
| GET    | `/api/hotels/:id`            | –    | One hotel. Add `?checkIn=&checkOut=` for rooms left |
| POST   | `/api/bookings`              | JWT  | Create a booking                              |
| GET    | `/api/bookings`              | JWT  | Your bookings, newest first                   |
| GET    | `/api/bookings/:id`          | JWT  | One of your bookings                          |
| PUT    | `/api/bookings/:id/cancel`   | JWT  | Cancel one of your bookings                   |

`GET /api/hotels` query parameters: `city`, `guests`, `minPrice`, `maxPrice`, `rating`, `featured=true`, `sort` (`price-low`, `price-high`, `rating`; default is "recommended").

Example booking request:

```json
POST /api/bookings
Authorization: Bearer <token>

{
  "hotelId": "…",
  "roomName": "Deluxe Room",
  "checkIn": "2026-10-10",
  "checkOut": "2026-10-13",
  "guests": 2,
  "rooms": 1
}
```

Every error has the same shape: `{ "message": "…" }`.

| Status | When |
| ------ | ---- |
| 400 | Bad input: invalid id, bad dates, unknown room, too many guests, duplicate email |
| 401 | Missing, invalid or expired token; wrong email/password |
| 404 | Hotel/booking not found (also used when a booking belongs to someone else) |
| 409 | Not enough rooms left for those dates |

## Local setup

You need Node.js 18+ and MongoDB (local install, Docker, or a free MongoDB Atlas cluster).

```bash
git clone https://github.com/<your-username>/devweekends-mern-hotel.git
cd devweekends-mern-hotel
```

**Backend**

```bash
cd server
npm install
cp .env.example .env      # then set MONGO_URI and a long random JWT_SECRET
npm run seed              # adds the sample hotels
npm run dev               # http://localhost:5000
```

**Frontend** (in a second terminal)

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm run dev               # http://localhost:5173
```

A quick way to generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Seed hotels

```bash
cd server
npm run seed
```

This deletes all hotels **and bookings**, then inserts 9 fictional hotels across Goa (2), Manali, Jaipur, Mumbai, Udaipur, Kochi, Bengaluru and Shillong. Bookings are cleared because they point at hotel ids that change on every seed. User accounts are not touched.

## Deployment

| Part     | Host          | URL |
| -------- | ------------- | --- |
| Frontend | Vercel        |     |
| Backend  | Render        |     |
| Database | MongoDB Atlas | –   |

**Render (backend)** — New Web Service → root directory `server`, build `npm install`, start `npm start`. Environment: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`. Run `npm run seed` once (Render Shell, or locally with the Atlas `MONGO_URI`).

**Vercel (frontend)** — Import the repo → root directory `client` (Vite is detected). Environment: `VITE_API_URL=<Render URL, no trailing slash>`.

After the first Vercel deploy, set `CLIENT_URL` on Render to the Vercel URL (no trailing slash) so CORS allows it.

## Security notes

- Passwords are hashed with bcrypt and never returned by the API (`select: false`).
- Login errors never reveal whether the email exists.
- Booking routes need a valid JWT; bookings are always looked up by `_id` **and** `user`, so one user can never read or cancel another user's booking.
- Prices are always calculated on the server.
- `.env` files are git-ignored; only `.env.example` files are committed.
