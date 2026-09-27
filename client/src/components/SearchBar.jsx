import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { daysFromToday, validateStay } from '../utils/format.js';

export const DESTINATIONS = ['Goa', 'Manali', 'Jaipur', 'Mumbai', 'Udaipur', 'Kochi', 'Bengaluru', 'Shillong'];

// The search box used on the home page (large) and above results (compact).
// Submitting it simply moves the search into the URL: /hotels?city=Goa&...
// The URL is the single source of truth, so results survive a refresh and
// can be shared as a link.
export function SearchBar({ initialValues = {}, compact = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    city: initialValues.city || '',
    checkIn: initialValues.checkIn || daysFromToday(1),
    checkOut: initialValues.checkOut || daysFromToday(3),
    guests: initialValues.guests || '2',
  });
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.city.trim()) {
      setError('Please enter a destination.');
      return;
    }
    const dateError = validateStay(form);
    if (dateError) {
      setError(dateError);
      return;
    }

    const params = new URLSearchParams({
      city: form.city.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      guests: String(form.guests),
    });
    navigate(`/hotels?${params}`);
  }

  return (
    <form className={`search-bar ${compact ? 'search-bar-compact' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="search-fields">
        <label className="field">
          <span>Destination</span>
          <input
            type="text"
            name="city"
            list="destinations"
            placeholder="Where are you going?"
            value={form.city}
            onChange={handleChange}
            autoComplete="off"
          />
          <datalist id="destinations">
            {DESTINATIONS.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </label>

        <label className="field">
          <span>Check-in</span>
          <input type="date" name="checkIn" min={daysFromToday(0)} value={form.checkIn} onChange={handleChange} />
        </label>

        <label className="field">
          <span>Check-out</span>
          <input
            type="date"
            name="checkOut"
            min={form.checkIn || daysFromToday(1)}
            value={form.checkOut}
            onChange={handleChange}
          />
        </label>

        <label className="field field-guests">
          <span>Guests</span>
          <input type="number" name="guests" min="1" max="12" value={form.guests} onChange={handleChange} />
        </label>

        <button type="submit" className="btn btn-primary search-button">
          Search
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default SearchBar;
