/**
 * Thin wrapper around the Order Service API.
 * Reads the JWT access token from localStorage (set by AuthProvider) and
 * attaches it as a Bearer token to every request.
 * Proactively refreshes an expired/expiring token BEFORE the request so
 * a 401 is never sent to the server (and never logged to the browser console).
 */

const ORDER_BASE  = import.meta.env.VITE_ORDER_API_BASE || 'http://localhost:5001/api';
const AUTH_BASE   = import.meta.env.VITE_AUTH_API_BASE  || 'http://localhost:5000/api/auth';
const TOKEN_KEY   = 'veloura_access_token';
const REFRESH_KEY = 'veloura_refresh_token';

export function getToken()   { return localStorage.getItem(TOKEN_KEY)   || ''; }
function getRefreshToken()   { return localStorage.getItem(REFRESH_KEY) || ''; }

/** Decode a JWT payload without verifying the signature (client-side only). */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Return true if the token is missing, invalid, or expiring within 30 s. */
function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now() + 30_000;
}

/** In-flight refresh promise — reused so parallel calls share one refresh. */
let refreshingPromise = null;

async function tryRefreshToken() {
  if (refreshingPromise) return refreshingPromise;
  refreshingPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    const res  = await fetch(`${AUTH_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Token refresh failed');
    if (data.accessToken)  localStorage.setItem(TOKEN_KEY,   data.accessToken);
    if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return data.accessToken;
  })();
  try {
    return await refreshingPromise;
  } finally {
    refreshingPromise = null;
  }
}

/** Get a guaranteed-fresh token, refreshing proactively if needed. */
async function getFreshToken() {
  const token = getToken();
  if (isTokenExpired(token)) {
    try { return await tryRefreshToken(); } catch { return token; }
  }
  return token;
}

async function parseResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const error = new Error(data.error || data.message || 'Request failed');
    error.status = res.status;
    error.data   = data;
    throw error;
  }
  return data;
}

async function request(path, options = {}) {
  const makeHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  });

  // Proactively refresh if the token is expired or expiring soon.
  // This prevents the 401 from ever reaching the server.
  const token = await getFreshToken();
  let res = await fetch(`${ORDER_BASE}${path}`, { ...options, headers: makeHeaders(token) });

  // On 401, attempt one silent token refresh and retry
  if (res.status === 401) {
    try {
      const newToken = await tryRefreshToken();
      res = await fetch(`${ORDER_BASE}${path}`, { ...options, headers: makeHeaders(newToken) });
    } catch {
      // Refresh failed — fall through so parseResponse throws the 401
    }
  }

  return parseResponse(res);
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const getCart = () => request('/cart');

export const addToCart = (item) =>
  request('/cart/add', { method: 'POST', body: JSON.stringify(item) });

export const updateCartItem = ({ productId, selectedSize, quantity }) =>
  request('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({ productId, selectedSize, quantity }),
  });

export const removeCartItem = ({ productId, selectedSize }) =>
  request('/cart/remove', {
    method: 'DELETE',
    body: JSON.stringify({ productId, selectedSize }),
  });

export const clearCart = () =>
  request('/cart/clear', { method: 'DELETE' });

// ── Orders ────────────────────────────────────────────────────────────────────
export const createOrder = (payload) =>
  request('/orders', { method: 'POST', body: JSON.stringify(payload) });

export const getUserOrders = () => request('/orders');

export const getOrder = (id) => request(`/orders/${id}`);

export const cancelOrder = (id) =>
  request(`/orders/${id}/cancel`, { method: 'PATCH' });

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllOrdersAdmin = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  return request(`/admin/orders${qs ? `?${qs}` : ''}`);
};

export const updateOrderStatusAdmin = (id, status) =>
  request(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
