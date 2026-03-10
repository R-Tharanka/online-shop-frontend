/**
 * Thin wrapper around the Order Service API.
 * Reads the JWT access token from localStorage (set by AuthProvider) and
 * attaches it as a Bearer token to every request.
 */

const ORDER_BASE = import.meta.env.VITE_ORDER_API_BASE || 'http://localhost:5001/api';
const TOKEN_KEY  = 'veloura_access_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${ORDER_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const error = new Error(data.error || data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
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
