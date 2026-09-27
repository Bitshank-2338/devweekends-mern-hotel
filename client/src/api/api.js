// Every call to the Express backend goes through this file.
// Keeping fetch in one place means each request automatically gets the JSON
// header, the JWT from localStorage, and the same error handling.

const API_URL = import.meta.env.VITE_API_URL;

export const SESSION_EXPIRED_EVENT = 'staysphere:session-expired';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // This header is how the backend knows who is calling.
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  } catch {
    // fetch only rejects when the request never reached the server at all,
    // for example the backend is stopped or the network is down.
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }

  // A failed response may have an empty body, so fall back to an empty object.
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 401 with a token means the token expired or is invalid. Drop the saved
    // session and tell App.jsx, so the navbar and pages switch to logged out.
    // (A 401 without a token is just a wrong password on the login form.)
    if (response.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }

  return data;
}

// Small wrappers so components read nicely: api.get('/api/hotels')
export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
};
