import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format.js';

// One hotel in a results grid. `stayQuery` carries the searched dates and
// guests over to the details page, e.g. "checkIn=...&checkOut=...&guests=2".
export function HotelCard({ hotel, stayQuery = '' }) {
  const detailsLink = `/hotels/${hotel._id}${stayQuery ? `?${stayQuery}` : ''}`;
  const price = hotel.startingPrice ?? Math.min(...hotel.rooms.map((room) => room.pricePerNight));

  return (
    <article className="hotel-card">
      <Link to={detailsLink} className="hotel-card-image">
        <img src={hotel.images[0]} alt={`${hotel.name} in ${hotel.city}`} loading="lazy" />
        {hotel.featured && <span className="badge">Featured</span>}
      </Link>

      <div className="hotel-card-body">
        <div className="hotel-card-heading">
          <div>
            <h3>{hotel.name}</h3>
            <p className="muted">
              {hotel.city}, {hotel.country}
            </p>
          </div>
          <span className="rating" aria-label={`Rated ${hotel.rating} out of 5`}>
            ★ {hotel.rating.toFixed(1)}
          </span>
        </div>

        <ul className="chip-list">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <li key={amenity} className="chip">
              {amenity}
            </li>
          ))}
        </ul>

        <div className="hotel-card-footer">
          <p className="price">
            <span className="muted">from</span> <strong>{formatPrice(price)}</strong>
            <span className="muted">/night</span>
          </p>
          <Link to={detailsLink} className="btn btn-primary btn-sm">
            View rooms
          </Link>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
