import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import SearchBar from '../components/SearchBar.jsx';
import HotelCard from '../components/HotelCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { daysFromToday } from '../utils/format.js';

function destinationPhoto(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;
}

const featuredDestinations = [
  { city: 'Goa', tagline: 'Beaches & sunsets', image: destinationPhoto('1507525428034-b723cf961d3e') },
  { city: 'Manali', tagline: 'Snow & pine forests', image: destinationPhoto('1626621341517-bbf3d9990a23') },
  { city: 'Jaipur', tagline: 'Forts & bazaars', image: destinationPhoto('1477587458883-47145ed94245') },
  { city: 'Mumbai', tagline: 'The city by the sea', image: destinationPhoto('1570168007204-dfb528c6958f') },
  { city: 'Udaipur', tagline: 'City of lakes', image: destinationPhoto('1439066615861-d1af74d74000') },
  { city: 'Kochi', tagline: 'Backwaters & spice', image: destinationPhoto('1602216056096-3b40cc0c9944') },
  { city: 'Bengaluru', tagline: 'Cafes & gardens', image: destinationPhoto('1596176530529-78163a4f7af2') },
  { city: 'Shillong', tagline: 'Clouds & waterfalls', image: destinationPhoto('1609920658906-8223bd289001') },
];

const benefits = [
  { title: 'Live room availability', text: 'See how many rooms are left for your exact dates before you book.' },
  { title: 'Clear, fair prices', text: 'Nights × rooms × nightly rate. The total you see is the total you pay.' },
  { title: 'Free cancellation', text: 'Plans changed? Cancel from My Bookings in one click.' },
];

// Default dates for the destination tiles: tomorrow for two nights.
const tileQuery = `checkIn=${daysFromToday(1)}&checkOut=${daysFromToday(3)}&guests=2`;

export function HomePage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadFeatured() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/hotels?featured=true');
      setHotels(data.hotels);
    } catch (err) {
      setError(`Could not load featured hotels. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeatured();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Find a stay that fits your journey</p>
          <h1>
            Stay somewhere <br />
            worth remembering.
          </h1>
          <p className="hero-lead">
            Search beautiful stays, compare rooms, and book your next trip in a few simple steps.
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <h2>Popular destinations</h2>
          <p className="muted">From Goa's beaches to Shillong's hills.</p>
        </div>
        <div className="destination-grid">
          {featuredDestinations.map((destination) => (
            <Link
              key={destination.city}
              to={`/hotels?city=${destination.city}&${tileQuery}`}
              className="destination-card"
            >
              <img src={destination.image} alt={`Scenery in ${destination.city}`} loading="lazy" />
              <span className="destination-text">
                <strong>{destination.city}</strong>
                <span>{destination.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-heading section-heading-row">
          <div>
            <h2>Featured stays</h2>
            <p className="muted">Guest favourites, hand-picked for this season.</p>
          </div>
          <Link to="/hotels" className="btn btn-outline btn-sm">
            See all hotels
          </Link>
        </div>

        {loading && <LoadingState message="Loading featured hotels..." />}
        <ErrorMessage message={error} onRetry={loadFeatured} />
        {!loading && !error && (
          <div className="hotel-grid">
            {hotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} stayQuery={tileQuery} />
            ))}
          </div>
        )}
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading">
            <h2>Why book with StaySphere</h2>
          </div>
          <div className="benefit-grid">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="benefit">
                <span className="benefit-number">0{index + 1}</span>
                <h3>{benefit.title}</h3>
                <p className="muted">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
