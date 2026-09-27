import { useEffect, useState } from 'react';

// Price and rating filters plus the sort order. Price fields are applied with
// the button (so we do not refetch on every keystroke); the selects apply
// immediately.
export function HotelFilters({ values, onApply, onReset }) {
  const [minPrice, setMinPrice] = useState(values.minPrice);
  const [maxPrice, setMaxPrice] = useState(values.maxPrice);
  const [error, setError] = useState('');

  // Keep the inputs in sync when the URL changes (e.g. after Reset).
  useEffect(() => {
    setMinPrice(values.minPrice);
    setMaxPrice(values.maxPrice);
  }, [values.minPrice, values.maxPrice]);

  function handleSubmit(event) {
    event.preventDefault();
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('Minimum price cannot be more than maximum price.');
      return;
    }
    setError('');
    onApply({ minPrice, maxPrice });
  }

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <div className="filters-row">
        <label className="field">
          <span>Min price (₹)</span>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="Any"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Max price (₹)</span>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="Any"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Rating</span>
          <select value={values.rating} onChange={(event) => onApply({ rating: event.target.value })}>
            <option value="">Any rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>
        <label className="field">
          <span>Sort by</span>
          <select value={values.sort} onChange={(event) => onApply({ sort: event.target.value })}>
            <option value="">Recommended</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Rating</option>
          </select>
        </label>
        <div className="filters-actions">
          <button type="submit" className="btn btn-primary btn-sm">
            Apply
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default HotelFilters;
