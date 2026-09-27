import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/api.js';
import RoomCard from '../components/RoomCard.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { countNights, daysFromToday, formatDate, formatPrice, plural, validateStay } from '../utils/format.js';

export function HotelDetailsPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The chosen stay and room live in the URL. That way, if a logged-out
  // visitor is sent to the login page, coming back to this exact URL
  // restores their dates, guests and selected room.
  const [searchParams, setSearchParams] = useSearchParams();
  const stay = {
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '2',
  };
  const selectedRoomName = searchParams.get('room') || '';
  const stayError = validateStay(stay);
  const nights = stayError ? 0 : countNights(stay.checkIn, stay.checkOut);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // The small date form above the rooms, before it is applied to the URL.
  const [stayForm, setStayForm] = useState({
    checkIn: stay.checkIn || daysFromToday(1),
    checkOut: stay.checkOut || daysFromToday(3),
    guests: stay.guests,
  });
  const [stayFormError, setStayFormError] = useState('');

  const [rooms, setRooms] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const summaryRef = useRef(null);
  const successRef = useRef(null);

  // After a booking, bring the confirmation message into view.
  useEffect(() => {
    if (confirmedBooking) {
      successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [confirmedBooking]);

  // Only ask for availability when the dates in the URL are valid.
  const availabilityQuery = stayError ? '' : `?checkIn=${stay.checkIn}&checkOut=${stay.checkOut}`;

  async function loadHotel({ quiet = false } = {}) {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/hotels/${id}${availabilityQuery}`);
      setHotel(data.hotel);
    } catch (err) {
      setError(err.status === 404 || err.status === 400 ? 'We could not find this hotel.' : `Could not load this hotel. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotel();
  }, [id, availabilityQuery]);

  const selectedRoom = !stayError && hotel ? hotel.rooms.find((room) => room.name === selectedRoomName) : null;
  const maxRooms = selectedRoom ? Math.max(selectedRoom.availableRooms ?? selectedRoom.totalRooms, 1) : 1;

  // When a room is picked, start with just enough rooms for the group.
  useEffect(() => {
    if (!selectedRoom) return;
    const needed = Math.ceil(Number(stay.guests) / selectedRoom.capacity);
    setRooms(Math.min(Math.max(needed, 1), maxRooms));
  }, [selectedRoomName, stay.guests, hotel]);

  function updateUrl(changes) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  }

  function handleStayChange(event) {
    const { name, value } = event.target;
    setStayForm((current) => ({ ...current, [name]: value }));
    setStayFormError('');
  }

  function handleStaySubmit(event) {
    event.preventDefault();
    const message = validateStay(stayForm);
    if (message) {
      setStayFormError(message);
      return;
    }
    setConfirmedBooking(null);
    updateUrl({ checkIn: stayForm.checkIn, checkOut: stayForm.checkOut, guests: String(stayForm.guests) });
  }

  function handleBook(room) {
    if (stayError) {
      setStayFormError('Choose your dates and press "Check availability" first.');
      document.getElementById('stay-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setConfirmedBooking(null);
    setBookingError('');
    updateUrl({ room: room.name });
    // On small screens the summary sits below the rooms, so bring it into view.
    setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleLogin() {
    navigate('/login', { state: { from: location.pathname + location.search } });
  }

  async function handleConfirm() {
    if (Number(stay.guests) > selectedRoom.capacity * rooms) {
      setBookingError(
        `${plural(rooms, 'room')} can host at most ${selectedRoom.capacity * rooms} guests. Add another room.`
      );
      return;
    }

    setSubmitting(true);
    setBookingError('');
    try {
      // Only what the guest chose is sent. The server looks up the price.
      const data = await api.post('/api/bookings', {
        hotelId: hotel._id,
        roomName: selectedRoom.name,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        guests: Number(stay.guests),
        rooms,
      });
      setConfirmedBooking(data.booking);
      updateUrl({ room: '' });
      // Refresh availability so the room counts include this booking.
      loadHotel({ quiet: true });
    } catch (err) {
      if (err.status === 401) {
        setBookingError('Your session has expired. Please log in again to book.');
      } else {
        setBookingError(err.message);
        // Someone else may have just booked, so show the latest numbers.
        if (err.status === 409) loadHotel({ quiet: true });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <LoadingState message="Loading hotel details..." />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container page">
        <ErrorMessage message={error || 'Hotel not found.'} onRetry={loadHotel} />
        <Link to="/hotels" className="btn btn-outline btn-sm">
          Back to all hotels
        </Link>
      </div>
    );
  }

  const startingPrice = Math.min(...hotel.rooms.map((room) => room.pricePerNight));
  const backParams = new URLSearchParams({ city: hotel.city });
  if (!stayError) {
    backParams.set('checkIn', stay.checkIn);
    backParams.set('checkOut', stay.checkOut);
    backParams.set('guests', stay.guests);
  }
  const backLink = `/hotels?${backParams}`;

  return (
    <div className="container page">
      <Link to={backLink} className="back-link">
        ← More stays in {hotel.city}
      </Link>

      <div className="gallery">
        {hotel.images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`${hotel.name} photo ${index + 1}`}
            className={index === 0 ? 'gallery-main' : ''}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      <div className="details-header">
        <div>
          <h1>{hotel.name}</h1>
          <p className="muted">{hotel.address}</p>
        </div>
        <div className="details-meta">
          <span className="rating rating-lg">★ {hotel.rating.toFixed(1)}</span>
          <p className="muted small">from {formatPrice(startingPrice)}/night</p>
        </div>
      </div>

      <div className="details-about">
        <p>{hotel.description}</p>
        <h2 className="h3">Amenities</h2>
        <ul className="chip-list">
          {hotel.amenities.map((amenity) => (
            <li key={amenity} className="chip">
              {amenity}
            </li>
          ))}
        </ul>
      </div>

      <form id="stay-form" className="stay-form" onSubmit={handleStaySubmit} noValidate>
        <label className="field">
          <span>Check-in</span>
          <input type="date" name="checkIn" min={daysFromToday(0)} value={stayForm.checkIn} onChange={handleStayChange} />
        </label>
        <label className="field">
          <span>Check-out</span>
          <input type="date" name="checkOut" min={stayForm.checkIn} value={stayForm.checkOut} onChange={handleStayChange} />
        </label>
        <label className="field field-guests">
          <span>Guests</span>
          <input type="number" name="guests" min="1" max="12" value={stayForm.guests} onChange={handleStayChange} />
        </label>
        <button type="submit" className="btn btn-primary">
          Check availability
        </button>
        {stayFormError && (
          <p className="form-error" role="alert">
            {stayFormError}
          </p>
        )}
      </form>

      {confirmedBooking && (
        <div ref={successRef} className="success-message" role="status">
          <div>
            <h2 className="h3">Booking confirmed!</h2>
            <p>
              {confirmedBooking.roomName} × {confirmedBooking.rooms} at {confirmedBooking.hotelName},{' '}
              {formatDate(confirmedBooking.checkIn)} → {formatDate(confirmedBooking.checkOut)}. Total{' '}
              <strong>{formatPrice(confirmedBooking.totalPrice)}</strong>.
            </p>
          </div>
          <Link to="/bookings" className="btn btn-primary btn-sm">
            View my bookings
          </Link>
        </div>
      )}

      <section className="rooms-section">
        <div className="section-heading">
          <h2>Available rooms</h2>
          <p className="muted">
            {stayError
              ? 'Choose your dates above to see how many rooms are left.'
              : `${formatDate(stay.checkIn)} → ${formatDate(stay.checkOut)} · ${plural(nights, 'night')} · ${plural(Number(stay.guests), 'guest')}`}
          </p>
        </div>

        <div className={`rooms-layout ${selectedRoom ? 'with-summary' : ''}`}>
          <div className="room-list">
            {hotel.rooms.map((room) => (
              <RoomCard
                key={room.name}
                room={room}
                guests={Number(stay.guests)}
                selected={room.name === selectedRoomName}
                onBook={handleBook}
              />
            ))}
          </div>

          {selectedRoom && (
            <div ref={summaryRef} className="summary-column">
              <BookingSummary
                hotel={hotel}
                room={selectedRoom}
                stay={stay}
                nights={nights}
                rooms={rooms}
                maxRooms={maxRooms}
                onRoomsChange={setRooms}
                onConfirm={handleConfirm}
                onClose={() => updateUrl({ room: '' })}
                onLogin={handleLogin}
                isLoggedIn={Boolean(user)}
                soldOut={selectedRoom.availableRooms === 0}
                submitting={submitting}
                error={bookingError}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HotelDetailsPage;
