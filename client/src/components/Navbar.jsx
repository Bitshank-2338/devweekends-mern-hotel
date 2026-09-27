import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

export function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // On every page change: close the mobile menu and start at the top, since
  // a single-page app keeps the old scroll position otherwise.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="StaySphere home">
          <span className="brand-mark" aria-hidden="true" />
          StaySphere
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">Toggle menu</span>
          <span className="menu-icon" aria-hidden="true" />
        </button>

        <nav id="main-menu" className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/hotels" end>
            Hotels
          </NavLink>
          {user ? (
            <>
              <NavLink to="/bookings">My Bookings</NavLink>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
