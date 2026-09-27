import { formatPrice, plural } from '../utils/format.js';

// One room type on the hotel details page. `availableRooms` is only known
// once dates are chosen, so it may be undefined.
export function RoomCard({ room, guests, selected, onBook }) {
  const { availableRooms } = room;
  const soldOut = availableRooms === 0;
  // Most guests this room type can take if every free room is booked.
  const maxGuests = room.capacity * (availableRooms ?? room.totalRooms);
  const tooSmall = guests > maxGuests;

  let availabilityText = '';
  if (availableRooms !== undefined) {
    availabilityText = soldOut ? 'Sold out for these dates' : `${plural(availableRooms, 'room')} left`;
  }

  return (
    <article className={`room-card ${selected ? 'room-card-selected' : ''}`}>
      <img src={room.image} alt={`${room.name} interior`} loading="lazy" />

      <div className="room-card-body">
        <div className="room-card-heading">
          <h3>{room.name}</h3>
          {availabilityText && (
            <span className={`availability ${soldOut ? 'availability-none' : ''}`}>{availabilityText}</span>
          )}
        </div>
        <p className="muted">{room.description}</p>
        <p className="room-capacity">Sleeps up to {plural(room.capacity, 'guest')} per room</p>

        <ul className="chip-list">
          {room.amenities.map((amenity) => (
            <li key={amenity} className="chip">
              {amenity}
            </li>
          ))}
        </ul>

        <div className="room-card-footer">
          <p className="price">
            <strong>{formatPrice(room.pricePerNight)}</strong>
            <span className="muted">/night</span>
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={soldOut || tooSmall}
            onClick={() => onBook(room)}
          >
            {soldOut ? 'Sold out' : tooSmall ? 'Too small for group' : selected ? 'Selected' : 'Book'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default RoomCard;
