import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="brand brand-footer">
            <span className="brand-mark" aria-hidden="true" />
            StaySphere
          </p>
          <p className="muted">Find a stay that fits your journey.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/hotels">All hotels</Link>
          <Link to="/bookings">My bookings</Link>
          <Link to="/register">Create account</Link>
        </nav>
        <p className="footer-note muted">
          A Dev Weekends learning project. Hotels are fictional and no payments are taken.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
