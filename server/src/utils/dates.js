// All booking dates are plain calendar days ("2026-10-10"), not moments in
// time. Every date is stored as midnight UTC of that day, so the server's own
// timezone never shifts a check-in by a day.

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// Turns "2026-10-10" into a Date at 2026-10-10T00:00:00Z.
// Returns null for anything that is not a real calendar day.
function parseDateOnly(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return null;

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  // new Date('2026-02-31') rolls over to March 3rd, so reject those.
  if (date.toISOString().slice(0, 10) !== value) return null;

  return date;
}

// Today's date at midnight UTC, comparable with parseDateOnly results.
function today() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function countNights(checkIn, checkOut) {
  return Math.round((checkOut - checkIn) / DAY_IN_MS);
}

// Validates a check-in/check-out pair. Returns { checkIn, checkOut, nights }
// or { error } with a message that can be shown to the user.
function validateStayDates(checkInValue, checkOutValue) {
  const checkIn = parseDateOnly(checkInValue);
  const checkOut = parseDateOnly(checkOutValue);

  if (!checkIn || !checkOut) {
    return { error: 'Please provide valid check-in and check-out dates (YYYY-MM-DD)' };
  }
  if (checkIn < today()) {
    return { error: 'Check-in date cannot be in the past' };
  }
  if (checkOut <= checkIn) {
    return { error: 'Check-out must be at least one day after check-in' };
  }

  const nights = countNights(checkIn, checkOut);
  if (nights > 30) {
    return { error: 'Stays are limited to 30 nights' };
  }

  return { checkIn, checkOut, nights };
}

module.exports = { parseDateOnly, validateStayDates, countNights };
