import { Navigate, useLocation } from 'react-router-dom';

// Guards a page in the browser: no logged-in user, no page.
//
// This is a convenience, not the security boundary. The real protection is
// the auth middleware on the server, which refuses requests without a JWT.
export function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (!user) {
    // Remember where the visitor was going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}

export default ProtectedRoute;
