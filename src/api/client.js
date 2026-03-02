const API_BASE = 'http://localhost:8081';

const LOGIN_PATHS = ['/auth/login', '/api/employees/login'];

function getAuthToken(path) {
  if (LOGIN_PATHS.some((p) => path.startsWith(p) || path === p)) return null;
  if (path.startsWith('/api/employees')) return localStorage.getItem('employeeToken');
  const jwt = localStorage.getItem('jwtToken') || localStorage.getItem('token');
  if (jwt) return jwt;
  // Allow employee to call /getAllAccounts and other read endpoints with employee token
  if (path === '/getAllAccounts' || path.startsWith('/searchAccount/') || path.startsWith('/api/transactions/')) {
    return localStorage.getItem('employeeToken');
  }
  return null;
}

async function request(path, options = {}) {
  const { responseType = 'json', ...init } = options;
  const token = getAuthToken(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401) {
    localStorage.clear();
    alert('Your session expired. Please login again.');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const message = err?.message || err?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return responseType === 'text' ? res.text() : res.json();
}

async function postForm(path, params) {
  const token = getAuthToken(path);
  const body = new URLSearchParams(params).toString();
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  });
  if (res.status === 401) {
    localStorage.clear();
    alert('Your session expired. Please login again.');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const message = err?.message || err?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  get: (path) => request(path),
  post: (path, body, responseType = 'json') =>
    request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, responseType }),
  postForm: (path, params) => postForm(path, params),
  put: (path, body) =>
    request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
