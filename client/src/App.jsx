import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { api, SESSION_EXPIRED_EVENT } from './api/api.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import HotelsPage from './pages/HotelsPage.jsx';
import HotelDetailsPage from './pages/HotelDetailsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Reads the login saved by a previous visit. localStorage survives a page
// refresh, React state does not, so this is what keeps you logged in.
function loadSavedUser() {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  if (!token || !savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

export function App() {
  const [user, setUser] = useState(loadSavedUser);
  // Shown on the login page, e.g. after an expired session.
  const [notice, setNotice] = useState('');

  // api.js fires this event when the server rejects our token.
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setNotice('Your session has expired. Please log in again.');
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  // On first load, ask the server whether the saved token is still valid.
  // If it is not, api.js clears it and the event above logs the user out.
  useEffect(() => {
    if (localStorage.getItem('token')) {
      api.get('/api/auth/me').catch(() => {});
    }
  }, []);

  // Called by the login and register pages once the API returns a token.
  function handleAuthSuccess({ user: loggedInUser, token }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setNotice('');
  }

  // A JWT is stateless, so logging out just means throwing the token away.
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotice('');
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailsPage user={user} />} />
            <Route
              path="/login"
              element={<LoginPage user={user} notice={notice} onAuthSuccess={handleAuthSuccess} />}
            />
            <Route path="/register" element={<RegisterPage user={user} onAuthSuccess={handleAuthSuccess} />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute user={user}>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
