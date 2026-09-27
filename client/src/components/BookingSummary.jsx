import { formatDate, formatPrice, plural } from '../utils/format.js';

// Everything the guest is about to book, shown before they confirm.
// The total here is only a preview: the server recalculates the real price
// from its own data when the booking is created.
export function BookingSummary({
  hotel,
  room,
  stay,
  nights,
  rooms,
  maxRooms,
  onRoomsChange,
  onConfirm,
  onClose,
  onLogin,
  isLoggedIn,
  soldOut,
  submitting,
  error,
}) {
  const total = nights * rooms * room.pricePerNight;
  const roomOptions = Array.from({ length: maxRooms }, (_, index) => index + 1);

  return (
    <aside className="booking-summary" aria-labelledby="summary-title">
      <div className="booking-summary-header">
        <h2 id="summary-title">Your booking</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
          Change room
        </button>
      </div>

      <dl className="summary-list">
        <div>
          <dt>Hotel</dt>
          <dd>{hotel.name}</dd>
        </div>
        <div>
          <dt>Room</dt>
          <dd>{room.name}</dd>
        </div>
        <div>
          <dt>Check-in</dt>
          <dd>{formatDate(stay.checkIn)}</dd>
        </div>
        <div>
          <dt>Check-out</dt>
          <dd>{formatDate(stay.checkOut)}</dd>
        </div>
        <div>
          <dt>Nights</dt>
          <dd>{nights}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{stay.guests}</dd>
        </div>
        <div>
          <dt>
            <label htmlFor="rooms-select">Rooms</label>
          </dt>
          <dd>
            <select
              id="rooms-select"
              value={rooms}
              onChange={(event) => onRoomsChange(Number(event.target.value))}
              disabled={submitting}
            >
              {roomOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </dd>
        </div>
        <div>
          <dt>Nightly price</dt>
          <dd>{formatPrice(room.pricePerNight)}</dd>
        </div>
      </dl>

      <p className="summary-math muted">
        {plural(nights, 'night')} × {plural(rooms, 'room')} × {formatPrice(room.pricePerNight)}
      </p>
      <p className="summary-total">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {isLoggedIn ? (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onConfirm}
          disabled={submitting || soldOut}
        >
          {submitting ? 'Confirming...' : soldOut ? 'Sold out for these dates' : 'Confirm booking'}
        </button>
      ) : (
        <>
          <p className="muted small">You need an account to book. Your selection will be kept.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={onLogin}>
            Log in to book
          </button>
        </>
      )}
      <p className="muted small center">No payment is taken. You can cancel any time.</p>
    </aside>
  );
}

export default BookingSummary;
