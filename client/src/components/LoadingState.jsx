export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;
