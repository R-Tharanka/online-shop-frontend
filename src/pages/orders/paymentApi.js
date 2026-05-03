/**
 * Thin wrapper around the Payment Service API.
 * Stripe payment is handled via redirect to Stripe Checkout.
 */

const PAYMENT_BASE = import.meta.env.VITE_PAYMENT_API_BASE || 'http://localhost:5003/api';

async function parseResponse(res) {
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

export async function createStripeCheckoutSession({ items }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const res = await fetch(`${PAYMENT_BASE}/payments/stripe/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      successUrl: `${origin}/order-details?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout?canceled=1`,
    }),
  });
  return parseResponse(res);
}

export async function getStripeSession(sessionId) {
  const res = await fetch(`${PAYMENT_BASE}/payments/stripe/session/${encodeURIComponent(sessionId)}`);
  return parseResponse(res);
}
