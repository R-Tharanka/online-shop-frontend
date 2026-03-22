/**
 * Thin wrapper around the Payment Service API.
 * Stripe payment is handled via redirect to Stripe Checkout.
 */

const DEFAULT_PAYMENT_BASE = 'http://localhost:5003/api';
const PAYMENT_BASE = (import.meta.env.VITE_PAYMENT_API_BASE || DEFAULT_PAYMENT_BASE)
  .trim()
  .replace(/\/$/, '');

function assertPaymentApiConfigured() {
  // In a hosted build, leaving the default localhost base will always fail in the browser.
  if (import.meta.env.PROD && PAYMENT_BASE === DEFAULT_PAYMENT_BASE) {
    throw new Error(
      'Payment API base URL is not configured. Set VITE_PAYMENT_API_BASE to your hosted Payment Service URL (e.g. https://<your-render-service>.onrender.com/api).'
    );
  }
}

async function parseResponse(res) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  if (!res.ok) {
    const error = new Error(data.error || data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function createStripeCheckoutSession({ items }) {
  assertPaymentApiConfigured();
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
  assertPaymentApiConfigured();
  const res = await fetch(`${PAYMENT_BASE}/payments/stripe/session/${encodeURIComponent(sessionId)}`);
  return parseResponse(res);
}
