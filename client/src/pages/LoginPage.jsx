import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { api } from '../api/api.js';

export function LoginPage({ user, notice, onAuthSuccess }) {
  const location = useLocation();
  // Where to go after logging in. Set by the booking flow or ProtectedRoute.
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (or just logged in): continue where the user was going.
  if (user) {
    return <Navigate to={from} replace />;
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post('/api/auth/login', form);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">
          {from !== '/' ? 'Log in to continue with your booking.' : 'Log in to book rooms and manage your trips.'}
        </p>

        {notice && <p className="notice">{notice}</p>}

        <label className="field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="muted center">
          New to StaySphere?{' '}
          <Link to="/register" state={{ from }}>
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
