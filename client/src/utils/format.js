// Small helpers shared by several pages. Dates in this app are plain calendar
// days written as "YYYY-MM-DD", the same format <input type="date"> uses.

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatPrice(amount) {
  return priceFormatter.format(amount);
}

// "2026-10-10" (or an ISO string from the API) -> "Sat, 10 Oct 2026"
export function formatDate(value) {
  const day = String(value).slice(0, 10);
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// A Date -> "YYYY-MM-DD" using the visitor's local calendar day.
export function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

export function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

// Checks a stay the same way the server does, so the user sees the problem
// before a request is even sent. Returns an error message or ''.
export function validateStay({ checkIn, checkOut, guests }) {
  if (!checkIn || !checkOut) return 'Please choose both check-in and check-out dates.';
  if (checkIn < daysFromToday(0)) return 'Check-in date cannot be in the past.';
  if (checkOut <= checkIn) return 'Check-out must be at least one day after check-in.';
  if (countNights(checkIn, checkOut) > 30) return 'Stays are limited to 30 nights.';
  if (guests !== undefined && !(Number(guests) >= 1)) return 'Please add at least 1 guest.';
  return '';
}

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
