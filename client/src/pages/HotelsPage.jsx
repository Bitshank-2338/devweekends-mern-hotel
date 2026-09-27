import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/api.js';
import SearchBar from '../components/SearchBar.jsx';
import HotelFilters from '../components/HotelFilters.jsx';
import HotelCard from '../components/HotelCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { countNights, formatDate, plural } from '../utils/format.js';

const FILTER_KEYS = ['minPrice', 'maxPrice', 'rating', 'sort'];

export function HotelsPage() {
  // Everything about the search lives in the URL, e.g.
  // /hotels?city=Goa&checkIn=2026-10-10&checkOut=2026-10-12&guests=2&sort=rating
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';

  const filters = {
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '',
  };

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // The query string the API needs. Dates are not sent: the list only needs
  // city/guests/price/rating; availability per date is checked on the
  // details page and again when booking.
  const apiParams = new URLSearchParams();
  if (city) apiParams.set('city', city);
  if (guests) apiParams.set('guests', guests);
  FILTER_KEYS.forEach((key) => filters[key] && apiParams.set(key, filters[key]));
  const apiQuery = apiParams.toString();

  async function loadHotels() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/hotels?${apiQuery}`);
      setHotels(data.hotels);
    } catch (err) {
      setError(`Could not load hotels. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
    // Re-run whenever the search or filters in the URL change.
  }, [apiQuery]);

  function applyFilters(changes) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams);
    FILTER_KEYS.forEach((key) => next.delete(key));
    setSearchParams(next);
  }

  // Passed on to each card so the details page opens with the same stay.
  const stayQuery = new URLSearchParams(
    Object.entries({ checkIn, checkOut, guests }).filter(([, value]) => value)
  ).toString();

  const nights = countNights(checkIn, checkOut);

  return (
    <div className="container page">
      <SearchBar key={searchParams.toString()} compact initialValues={{ city, checkIn, checkOut, guests }} />

      <div className="results-header">
        <div>
          <h1 className="results-title">{city ? `Stays in ${city}` : 'All stays'}</h1>
          {checkIn && checkOut && nights > 0 && (
            <p className="muted">
              {formatDate(checkIn)} → {formatDate(checkOut)} · {plural(nights, 'night')}
              {guests && ` · ${plural(Number(guests), 'guest')}`}
            </p>
          )}
        </div>
        {!loading && !error && (
          <p className="result-count">{plural(hotels.length, 'hotel')} found</p>
        )}
      </div>

      <HotelFilters values={filters} onApply={applyFilters} onReset={resetFilters} />

      {loading && <LoadingState message="Finding hotels..." />}
      <ErrorMessage message={error} onRetry={loadHotels} />

      {!loading && !error && hotels.length === 0 && (
        <div className="empty-state">
          <h2>No hotels match your search</h2>
          <p className="muted">
            {city
              ? `We could not find stays in "${city}" for ${guests || 1} guest(s) with these filters.`
              : 'Try removing some filters.'}{' '}
            Try another destination or reset the filters.
          </p>
          <div className="empty-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
              Reset filters
            </button>
            <Link to="/hotels" className="btn btn-ghost btn-sm">
              Browse all hotels
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && hotels.length > 0 && (
        <div className="hotel-grid">
          {hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} stayQuery={stayQuery} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HotelsPage;
