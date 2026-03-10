import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from './orderApi';

const REQUIRED = ['fullName', 'address', 'city', 'postalCode', 'phone'];

function readItems() {
  try {
    const buyNow = sessionStorage.getItem('buyNow');
    if (buyNow) return { items: [JSON.parse(buyNow)], isBuyNow: true };
    return { items: JSON.parse(sessionStorage.getItem('cart') || '[]'), isBuyNow: false };
  } catch { return { items: [], isBuyNow: false }; }
}

const STEPS = ['Cart', 'Shipping', 'Payment', 'Confirm'];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done ? 'text-white' : active ? 'text-white' : 'bg-gray-100 text-gray-400'
                }`}
                style={done || active ? { background: 'var(--color-primary)' } : {}}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-4 mx-1 transition-all"
                style={{ background: done ? 'var(--color-primary)' : '#e5e7eb' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, isBuyNow } = readItems();

  const [shipping, setShipping] = useState({
    fullName: '', address: '', city: '', postalCode: '', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formErrors, setFormErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    REQUIRED.forEach(f => { if (!shipping[f].trim()) errs[f] = 'This field is required'; });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    setOrderError('');
    try {
      const order = await createOrder({ items, shippingAddress: shipping, paymentMethod });
      if (isBuyNow) sessionStorage.removeItem('buyNow');
      else sessionStorage.removeItem('cart');
      navigate('/order-details', { state: { order } });
    } catch (err) {
      setOrderError(
        err.status === 401
          ? 'Please log in to place an order.'
          : err.message || 'Failed to place order. Please try again.'
      );
      setPlacing(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4"
        style={{ background: 'var(--bg-gradient)' }}>
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-4xl"
          style={{ background: 'rgba(95,68,255,0.08)' }}>🛒</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add some items before checking out.</p>
        <Link to="/products"
          className="px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          Browse Products
        </Link>
      </div>
    );

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const field = (name, label, placeholder, type = 'text') => (
    <div key={name}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={shipping[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={name}
        className={`w-full rounded-xl px-4 py-3 text-sm border transition-all outline-none focus:ring-2 ${
          formErrors[name]
            ? 'border-red-400 bg-red-50 focus:ring-red-200'
            : 'border-gray-200 bg-white focus:ring-[color:var(--color-accent)] focus:border-[color:var(--color-accent)]'
        }`}
      />
      {formErrors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span>&#9888;</span> {formErrors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(95,68,255,0.1)' }}>
              💳
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Checkout</h1>
          </div>
          <p className="text-sm text-gray-500 ml-[52px]">Complete your order in just a few steps</p>
        </div>

        <StepBar current={1} />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Left: Forms */}
          <div className="md:col-span-3 space-y-5">

            {/* Shipping address card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: 'rgba(95,68,255,0.08)' }}>📦</div>
                <h3 className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                  Shipping Address
                </h3>
              </div>
              <div className="space-y-4">
                {field('fullName', 'Full Name', 'Jane Doe')}
                {field('address', 'Street Address', '123 Main Street, Apt 4B')}
                <div className="grid grid-cols-2 gap-3">
                  {field('city', 'City', 'Colombo')}
                  {field('postalCode', 'Postal Code', '10200')}
                </div>
                {field('phone', 'Phone Number', '+94 77 123 4567', 'tel')}
              </div>
            </div>

            {/* Payment method card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: 'rgba(95,68,255,0.08)' }}>💳</div>
                <h3 className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                  Payment Method
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'card', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard' },
                  { value: 'cash_on_delivery', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when received' },
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === m.value
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">{m.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: paymentMethod === m.value ? 'var(--color-primary)' : '#374151' }}>
                      {m.label}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">{m.sub}</span>
                    {paymentMethod === m.value && (
                      <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: 'var(--color-primary)' }}>
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {paymentMethod === 'card' && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <span>🔒</span> Card details collected securely at delivery confirmation.
                </p>
              )}
            </div>

            {/* Error banner */}
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <span>&#9888;</span> {orderError}
              </div>
            )}

            {/* Place order button */}
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--color-primary)' }}
            >
              {placing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Placing Order...
                </>
              ) : (
                `Place Order · Rs ${fmt(subtotal)}`
              )}
            </button>

            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
              <span>🔒</span> Your order and payment info are secure
            </p>
          </div>

          {/* Right: Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-primary)' }}>
                Order Summary
                <span className="ml-2 text-xs font-normal text-gray-400">({items.length} item{items.length !== 1 ? 's' : ''})</span>
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-5">
                {items.map(item => (
                  <div key={`${item.productId}-${item.selectedSize}`} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={item.imageUrl || 'https://placehold.co/48x48?text=?'}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: 'var(--color-accent)' }}>
                          {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-primary)' }}>
                        {item.productName || item.productId}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.selectedSize && `Size: ${item.selectedSize} · `}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold shrink-0" style={{ color: 'var(--color-primary)' }}>
                      Rs {fmt((item.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>Rs {fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span style={{ color: 'var(--color-primary)' }}>Total</span>
                  <span style={{ color: 'var(--color-accent)' }}>Rs {fmt(subtotal)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>🔒</span><span>SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>↩️</span><span>30-day hassle-free returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}