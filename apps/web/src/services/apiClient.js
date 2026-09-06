const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('flownix_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('flownix_token', token);
  } else {
    localStorage.removeItem('flownix_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const authAPI = {
  register: (username, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () => request('/auth/me')
};

export const diagramAPI = {
  create: (title, description, sourceCode, isPublic = true) =>
    request('/diagrams', {
      method: 'POST',
      body: JSON.stringify({ title, description, sourceCode, isPublic })
    }),

  list: () => request('/diagrams'),

  getById: (id) => request(`/diagrams/${id}`),

  update: (id, updates) =>
    request(`/diagrams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  delete: (id) =>
    request(`/diagrams/${id}`, {
      method: 'DELETE'
    }),

  getShared: (shareId) => request(`/share/${shareId}`)
};
