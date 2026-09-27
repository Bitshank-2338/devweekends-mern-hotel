// A readable error box. Pass onRetry to show a "Try again" button.
export function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
