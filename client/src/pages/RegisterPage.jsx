import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { api } from '../api/api.js';

const emailPattern = /^\S+@\S+\.\S+$/;

export function RegisterPage({ user, onAuthSuccess }) {
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={from} replace />;
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Same rules as the server, checked here first for a faster answer.
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!emailPattern.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post('/api/auth/register', form);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">It takes less than a minute.</p>

        <label className="field">
          <span>Full name</span>
          <input type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
        </label>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="muted center">
          Already have an account?{' '}
          <Link to="/login" state={{ from }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
