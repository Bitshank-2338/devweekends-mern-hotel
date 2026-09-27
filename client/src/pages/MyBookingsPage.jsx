import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatDate, formatPrice, plural } from '../utils/format.js';

export function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Which booking is being cancelled right now, and any error for it.
  const [cancellingId, setCancellingId] = useState('');
  const [cancelError, setCancelError] = useState({ id: '', message: '' });

  async function loadBookings() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/bookings');
      setBookings(data.bookings);
    } catch (err) {
      setError(`Could not load your bookings. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(booking) {
    const ok = window.confirm(`Cancel your ${booking.roomName} at ${booking.hotelName}?`);
    if (!ok) return;

    setCancellingId(booking._id);
    setCancelError({ id: '', message: '' });
    try {
      const data = await api.put(`/api/bookings/${booking._id}/cancel`);
      // Swap the updated booking into state so the UI changes immediately,
      // without reloading the whole list.
      setBookings((current) => current.map((item) => (item._id === booking._id ? data.booking : item)));
    } catch (err) {
      setCancelError({ id: booking._id, message: `Could not cancel this booking. ${err.message}` });
    } finally {
      setCancellingId('');
    }
  }

  const upcomingCount = bookings.filter((booking) => booking.status === 'confirmed').length;

  return (
    <div className="container page">
      <div className="results-header">
        <div>
          <h1 className="results-title">My bookings</h1>
          {!loading && !error && (
            <p className="muted">
              {plural(upcomingCount, 'confirmed booking')} · {bookings.length} in total
            </p>
          )}
        </div>
        <Link to="/hotels" className="btn btn-outline btn-sm">
          Book another stay
        </Link>
      </div>

      {loading && <LoadingState message="Loading your bookings..." />}
      <ErrorMessage message={error} onRetry={loadBookings} />

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <h2>No bookings yet</h2>
          <p className="muted">When you book a room it will show up here.</p>
          <Link to="/hotels" className="btn btn-primary btn-sm">
            Find a hotel
          </Link>
        </div>
      )}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article key={booking._id} className={`booking-item ${booking.status === 'cancelled' ? 'is-cancelled' : ''}`}>
            {booking.hotelImage && <img src={booking.hotelImage} alt={booking.hotelName} loading="lazy" />}

            <div className="booking-info">
              <div className="booking-info-top">
                <div>
                  <h2 className="h3">
                    <Link to={`/hotels/${booking.hotel}`}>{booking.hotelName}</Link>
                  </h2>
                  <p className="muted">
                    {booking.hotelCity} · {booking.roomName} × {booking.rooms}
                  </p>
                </div>
                <span className={`status status-${booking.status}`}>{booking.status}</span>
              </div>

              <dl className="booking-facts">
                <div>
                  <dt>Check-in</dt>
                  <dd>{formatDate(booking.checkIn)}</dd>
                </div>
                <div>
                  <dt>Check-out</dt>
                  <dd>{formatDate(booking.checkOut)}</dd>
                </div>
                <div>
                  <dt>Guests</dt>
                  <dd>{booking.guests}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatPrice(booking.totalPrice)}</dd>
                </div>
              </dl>

              <div className="booking-actions">
                <p className="muted small">
                  {plural(booking.nights, 'night')} × {plural(booking.rooms, 'room')} ×{' '}
                  {formatPrice(booking.pricePerNight)}
                </p>
                {booking.status === 'confirmed' && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancel(booking)}
                    disabled={cancellingId === booking._id}
                  >
                    {cancellingId === booking._id ? 'Cancelling...' : 'Cancel booking'}
                  </button>
                )}
              </div>

              {cancelError.id === booking._id && (
                <p className="form-error" role="alert">
                  {cancelError.message}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MyBookingsPage;
