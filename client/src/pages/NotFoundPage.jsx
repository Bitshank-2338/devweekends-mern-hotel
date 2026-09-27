import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container page empty-state">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary btn-sm">
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;
