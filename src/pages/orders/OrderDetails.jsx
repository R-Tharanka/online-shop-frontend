import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getUserOrders, getOrder, cancelOrder, getToken, createOrder } from './orderApi';
import { getStripeSession } from './paymentApi';

const STATUS_CONFIG = {
  pending:    { style: 'bg-amber-100 text-amber-700 border-amber-200',    icon: '🕐', label: 'Pending',    bar: 1 },
  processing: { style: 'bg-blue-100 text-blue-700 border-blue-200',       icon: '⚙️', label: 'Processing', bar: 2 },
  shipped:    { style: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🚚', label: 'Shipped',    bar: 3 },
  delivered:  { style: 'bg-green-100 text-green-700 border-green-200',    icon: '✅', label: 'Delivered',  bar: 4 },
  cancelled:  { style: 'bg-red-100 text-red-600 border-red-200',          icon: '❌', label: 'Cancelled',  bar: 0 },
};

const TIMELINE = ['Pending', 'Processing', 'Shipped', 'Delivered'];

function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { style: 'bg-gray-100 text-gray-600 border-gray-200', icon: '•', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border capitalize
      ${size === 'sm' ? 'text-xs' : 'text-sm'} ${cfg.style}`}>
      <span>{cfg.icon}</span> {cfg.label}
    </span>
  );
}

function OrderTimeline({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (status === 'cancelled' || !cfg) return null;
  const current = cfg.bar;
  return (
    <div className="flex items-center gap-0 my-5">
      {TIMELINE.map((step, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? 'text-white border-transparent' :
                  active ? 'text-white border-transparent' :
                  'bg-gray-50 border-gray-200 text-gray-300'
                }`}
                style={done || active ? { background: done ? '#22c55e' : 'var(--color-primary)', borderColor: 'transparent' } : {}}
              >
                {done ? '✓' : stepNum}
              </div>
              <span className={`text-[9px] mt-1 font-medium text-center leading-tight max-w-[48px] ${
                active ? 'text-gray-700' : done ? 'text-green-600' : 'text-gray-300'
              }`}>
                {step}
              </span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div className="flex-1 h-0.5 mb-4 mx-0.5 transition-all rounded-full"
                style={{ background: done ? '#22c55e' : '#e5e7eb' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onSelect, onCancel, cancellingId, active }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const fmt = (n) => (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div
      onClick={() => onSelect(order._id)}
      className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        active ? 'border-[color:var(--color-primary)] ring-1 ring-[color:var(--color-primary)]/20' : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Order ID</p>
          <p className="font-mono text-xs font-semibold text-gray-700 mt-0.5">{order._id}</p>
          <p className="text-[10px] text-gray-400 mt-1">{date}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Item thumbnails */}
      <div className="flex items-center gap-1.5 mb-3">
        {order.items?.slice(0, 4).map((item, i) => (
          <img
            key={i}
            src={item.imageUrl || 'https://placehold.co/36x36?text=?'}
            alt={item.productName}
            className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
          />
        ))}
        {order.items?.length > 4 && (
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold shrink-0">
            +{order.items.length - 4}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
        <p className="font-bold text-sm" style={{ color: 'var(--color-accent)' }}>
          Rs {fmt(order.total)}
        </p>
      </div>

      {order.status === 'pending' && (
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(order._id); }}
          disabled={cancellingId === order._id}
          className="mt-3 w-full py-1.5 text-xs font-semibold border border-red-300 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}

function OrderDetailView({ order, onBack, onCancel, cancellingId }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const fmt = (n) => (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Detail header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-medium flex items-center gap-1 mb-3 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              &#8592; All Orders in frontend
            </button>
          )}
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Order Details</h3>
          <p className="font-mono text-xs text-gray-400 mt-0.5">{order._id}</p>
          <p className="text-xs text-gray-400 mt-0.5">{date}</p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      {/* Timeline */}
      <OrderTimeline status={order.status} />

      {/* Items */}
      <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Items Ordered</h4>
      <div className="space-y-3 mb-6">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <img
              src={item.imageUrl || 'https://placehold.co/56x56?text=?'}
              alt={item.productName}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>
                {item.productName || item.productId}
              </p>
              {item.brand && <p className="text-xs text-gray-400">{item.brand}</p>}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {item.selectedSize && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'var(--color-accent)' }}>
                    {item.selectedSize}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity}</span>
                <span className="text-[10px] text-gray-400">@ Rs {fmt(item.price)}</span>
              </div>
            </div>
            <p className="font-bold text-sm shrink-0" style={{ color: 'var(--color-primary)' }}>
              Rs {fmt((item.price || 0) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Price summary */}
      <div className="rounded-xl p-4 mb-4 space-y-2 text-sm" style={{ background: 'rgba(31,27,46,0.03)' }}>
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span><span>Rs {fmt(order.total)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className="text-green-600 font-semibold">Free</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
          <span style={{ color: 'var(--color-primary)' }}>Total</span>
          <span style={{ color: 'var(--color-accent)' }}>Rs {fmt(order.total)}</span>
        </div>
      </div>

      {/* Shipping + payment row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {order.shippingAddress?.fullName && (
          <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(31,27,46,0.03)' }}>
            <p className="font-bold text-xs uppercase tracking-wide text-gray-400 mb-2">📦 Ship To</p>
            <p className="font-semibold text-gray-700">{order.shippingAddress.fullName}</p>
            <p className="text-gray-500 text-xs">{order.shippingAddress.address}</p>
            <p className="text-gray-500 text-xs">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p className="text-gray-500 text-xs">{order.shippingAddress.phone}</p>
          </div>
        )}
        {order.paymentMethod && (
          <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(31,27,46,0.03)' }}>
            <p className="font-bold text-xs uppercase tracking-wide text-gray-400 mb-2">💳 Payment</p>
            <p className="font-semibold text-gray-700 capitalize">
              {order.paymentMethod === 'card' ? '💳 Credit / Debit Card' : '💵 Cash on Delivery'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {order.paymentMethod === 'card' ? 'Paid online via Stripe' : 'Pay when received'}
            </p>
          </div>
        )}
      </div>

      {/* Cancel */}
      {order.status === 'pending' && (
        <button
          onClick={() => onCancel(order._id)}
          disabled={cancellingId === order._id}
          className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}

export default function OrderDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const [justPlaced, setJustPlaced] = useState(!!location.state?.order);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSessionId = params.get('session_id');

    // If we returned from Stripe, finalize the order first.
    if (stripeSessionId) {
      (async () => {
        try {
          if (!getToken()) {
            setError('Please log in to complete your order.');
            setLoading(false);
            return;
          }

          const pendingRaw = sessionStorage.getItem('pendingCheckout');
          const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
          if (!pending?.items?.length || !pending?.shippingAddress) {
            setError('Missing checkout details. Please try again from Checkout.');
            setLoading(false);
            return;
          }

          const session = await getStripeSession(stripeSessionId);
          if (session?.payment_status !== 'paid') {
            setError('Payment not completed. Please try again.');
            setLoading(false);
            return;
          }

          const order = await createOrder({
            items: pending.items,
            shippingAddress: pending.shippingAddress,
            paymentMethod: pending.paymentMethod || 'card',
          });

          if (pending.isBuyNow) sessionStorage.removeItem('buyNow');
          else sessionStorage.removeItem('cart');
          sessionStorage.removeItem('pendingCheckout');

          // Update local state so the UI shows the new order immediately.
          setOrders((prev) => (Array.isArray(prev) ? [order, ...prev] : [order]));
          setSelectedOrder(order);
          setJustPlaced(true);
          setLoading(false);
          setError('');

          // Replace URL to drop the session_id without relying on a remount.
          navigate('/order-details', { replace: true });
        } catch (err) {
          setError(err?.message || 'Could not finalize the payment.');
          setLoading(false);
        }
      })();
      return;
    }

    // Skip the API call entirely when no token is present to avoid a
    // guaranteed 401 console error when the user is not logged in.
    if (!getToken()) {
      setError('Please log in to view your orders.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    getUserOrders()
      .then(data => { if (!cancelled) { setOrders(data); setLoading(false); } })
      .catch(err => {
        if (cancelled) return;
        setError(err.status === 401 ? 'Please log in to view your orders.' : 'Failed to load orders.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (location.state?.order) setJustPlaced(true);
  }, [location.state]);

  const handleSelectOrder = async (id) => {
    try {
      const order = await getOrder(id);
      setSelectedOrder(order);
    } catch { /* silent */ }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      const updated = await cancelOrder(id);
      setOrders(prev => prev.map(o => o._id === id ? updated : o));
      if (selectedOrder?._id === id) setSelectedOrder(updated);
    } catch (err) {
      alert(err.message || 'Could not cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-[color:var(--color-primary)] border-gray-200 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-gradient)' }}>
        <div className="max-w-sm w-full bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold text-gray-800 mb-1">{error}</p>
          {error.includes('log in') && (
            <button
              onClick={() => navigate('/auth/login')}
              className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(95,68,255,0.1)' }}>
              📦
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>My Orders</h1>
          </div>
          <p className="text-sm text-gray-500 ml-[52px]">Track and manage your recent purchases</p>
        </div>

        {/* Success banner */}
        {justPlaced && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl shrink-0">🎉</div>
            <div>
              <p className="font-bold text-green-700">Order Placed Successfully!</p>
              <p className="text-sm text-green-600">Thank you! We will process your order shortly.</p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm text-center py-24 px-8">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl"
              style={{ background: 'rgba(95,68,255,0.06)' }}>
              📭
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              No orders yet
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              Your order history will appear here once you make a purchase.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              Start Shopping &#8594;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

            {/* Order list */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-1">
                {orders.length} Order{orders.length !== 1 ? 's' : ''}
              </p>
              {orders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  active={selectedOrder?._id === order._id}
                  onSelect={handleSelectOrder}
                  onCancel={handleCancel}
                  cancellingId={cancellingId}
                />
              ))}
            </div>

            {/* Detail pane */}
            <div className="md:col-span-3">
              {selectedOrder ? (
                <OrderDetailView
                  order={selectedOrder}
                  onBack={!justPlaced ? () => setSelectedOrder(null) : undefined}
                  onCancel={handleCancel}
                  cancellingId={cancellingId}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-64 flex flex-col items-center justify-center text-center px-8">
                  <div className="text-5xl mb-3 opacity-30">👈</div>
                  <p className="font-semibold text-gray-400">Select an order to view details</p>
                  <p className="text-xs text-gray-300 mt-1">Click any order on the left</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}