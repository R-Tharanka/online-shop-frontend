import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PRODUCT_API = import.meta.env.VITE_PRODUCT_API_BASE || 'http://localhost:5002/api/products';

function readCart() {
  try { return JSON.parse(sessionStorage.getItem('cart') || '[]'); } catch { return []; }
}
function writeCart(items) {
  sessionStorage.setItem('cart', JSON.stringify(items));
}
function itemKey(item) {
  return `${item.productId}-${item.selectedSize}`;
}

/** Silently restore qty units back to product stock. Fire-and-forget — cart UX must not block on this. */
async function restoreStock(productId, qty) {
  if (!productId || !qty || qty < 1) return;
  try {
    await fetch(`${PRODUCT_API}/${productId}/stock/restore`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    });
  } catch { /* non-critical — do not surface stock errors to the user */ }
}

/** Silently deduct qty units from product stock (used when increasing cart qty). */
async function deductStock(productId, qty) {
  if (!productId || !qty || qty < 1) return;
  try {
    await fetch(`${PRODUCT_API}/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    });
  } catch { /* non-critical */ }
}

function TrustBadge({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="text-base">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function Cart() {
  const navigate  = useNavigate();
  const [items,   setItems]   = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [removed, setRemoved] = useState(null);

  useEffect(() => {
    const loaded = readCart();
    setItems(loaded);
    // Select all items by default, like Daraz
    setSelected(new Set(loaded.map(itemKey)));
  }, []);

  /* ── selection helpers ── */
  const allSelected = items.length > 0 && items.every(i => selected.has(itemKey(i)));
  const someSelected = items.some(i => selected.has(itemKey(i)));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map(itemKey)));
  };

  const toggleOne = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /* ── cart mutation helpers ── */
  const updateQty = (productId, selectedSize, delta) => {
    const updated = items.map(item => {
      if (item.productId === productId && item.selectedSize === selectedSize) {
        const newQty = item.quantity + delta;
        if (newQty < 1) {
          // Item will be removed — restore its full current quantity
          restoreStock(productId, item.quantity);
          return null;
        }
        // Qty decreased → restore 1 unit; qty increased → deduct 1 unit
        if (delta < 0) restoreStock(productId, 1);
        else           deductStock(productId, 1);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean);
    writeCart(updated);
    setItems(updated);
  };

  const removeItem = (productId, selectedSize, name, quantity) => {
    const key = `${productId}-${selectedSize}`;
    const updated = items.filter(item => itemKey(item) !== key);
    writeCart(updated);
    setItems(updated);
    setSelected(prev => { const next = new Set(prev); next.delete(key); return next; });
    // Restore the removed item's stock
    restoreStock(productId, quantity);
    setRemoved(name || 'Item');
    setTimeout(() => setRemoved(null), 3000);
  };

  const removeSelected = () => {
    const toRemove = items.filter(item => selected.has(itemKey(item)));
    const updated = items.filter(item => !selected.has(itemKey(item)));
    writeCart(updated);
    setItems(updated);
    // Restore stock for every removed item
    toRemove.forEach(item => restoreStock(item.productId, item.quantity));
    setSelected(new Set());
    setRemoved(`${selected.size} item${selected.size !== 1 ? 's' : ''}`);
    setTimeout(() => setRemoved(null), 3000);
  };

  /* ── checkout with selected items ── */
  const handleCheckout = () => {
    const selectedItems = items.filter(item => selected.has(itemKey(item)));
    sessionStorage.setItem('cart', JSON.stringify(selectedItems));
    setItems(selectedItems);
    navigate('/checkout');
  };

  /* ── derived totals (selected only) ── */
  const selectedItems = items.filter(item => selected.has(itemKey(item)));
  const subtotal  = selectedItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const itemCount = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(95,68,255,0.1)' }}>
              🛒
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Your Cart
            </h1>
          </div>
          {items.length > 0 && (
            <p className="text-sm text-gray-500 ml-[52px]">
              {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} in cart
              {selected.size > 0 && ` · ${selected.size} selected`}
            </p>
          )}
        </div>

        {/* Removed toast */}
        {removed && (
          <div className="mb-4 px-4 py-3 bg-white border border-orange-100 rounded-xl shadow-sm text-sm text-gray-600 flex items-center gap-2">
            <span className="text-orange-400 text-base">⊗</span>
            <span><strong>{removed}</strong> removed from cart</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm text-center py-24 px-8">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl"
              style={{ background: 'rgba(95,68,255,0.06)' }}>
              🛍️
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              Your cart is empty
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              Discover our latest collection and find something you love.
            </p>
            <Link to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}>
              Browse Collection &#8594;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Cart Items column */}
            <div className="lg:col-span-2">

              {/* Select-all toolbar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-3 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-[color:var(--color-primary)] cursor-pointer"
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    Select All ({items.length} item{items.length !== 1 ? 's' : ''})
                  </span>
                </label>
                {someSelected && (
                  <button
                    onClick={removeSelected}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>&#x2715;</span> Remove Selected ({selected.size})
                  </button>
                )}
              </div>

              {/* Item cards */}
              <div className="space-y-3">
                {items.map(item => {
                  const key = itemKey(item);
                  const isSelected = selected.has(key);
                  return (
                    <div
                      key={key}
                      className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-[color:var(--color-primary)] ring-1 ring-[color:var(--color-primary)]/10'
                          : 'border-gray-100 opacity-60'
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(key)}
                        className="w-4 h-4 rounded shrink-0 cursor-pointer accent-[color:var(--color-primary)]"
                      />

                      {/* Image + size badge */}
                      <div className="relative shrink-0">
                        <img
                          src={item.imageUrl || 'https://placehold.co/80x80?text=?'}
                          alt={item.productName || item.productId}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        {item.selectedSize && (
                          <span
                            className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
                            style={{ background: 'var(--color-accent)' }}
                          >
                            {item.selectedSize}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>
                          {item.productName || item.productId}
                        </p>
                        {item.brand && <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>}
                        {item.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                            {item.category}
                          </span>
                        )}
                        <p className="text-sm font-bold mt-1.5" style={{ color: 'var(--color-accent)' }}>
                          Rs {fmt(item.price || 0)}
                          <span className="text-xs font-normal text-gray-400"> / each</span>
                        </p>
                      </div>

                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(item.productId, item.selectedSize, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        >
                          &#8722;
                        </button>
                        <span className="w-8 text-center text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.selectedSize, +1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="w-24 text-right shrink-0">
                        <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                          Rs {fmt((item.price || 0) * item.quantity)}
                        </p>
                      </div>

                      {/* Remove button — always visible */}
                      <button
                        onClick={() => removeItem(item.productId, item.selectedSize, item.productName, item.quantity)}
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-100"
                        title="Remove item"
                      >
                        &#x2715;
                      </button>
                    </div>
                  );
                })}
              </div>

              <Link to="/products"
                className="flex items-center gap-2 text-sm font-medium px-2 py-1 mt-4 w-fit hover:underline transition-colors"
                style={{ color: 'var(--color-accent)' }}>
                &#8592; Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-primary)' }}>
                  Order Summary
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  {selected.size} of {items.length} item{items.length !== 1 ? 's' : ''} selected
                </p>

                {/* Selected item lines */}
                {selectedItems.length > 0 ? (
                  <div className="space-y-2 mb-5">
                    {selectedItems.map(item => (
                      <div key={itemKey(item)} className="flex justify-between text-xs text-gray-500">
                        <span className="truncate max-w-[140px]">
                          {item.productName}{item.selectedSize ? ` (${item.selectedSize})` : ''} &times;{item.quantity}
                        </span>
                        <span className="font-medium shrink-0 ml-2">
                          Rs {fmt((item.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-5 py-4 rounded-xl text-center text-xs text-gray-400 bg-gray-50">
                    No items selected
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-2.5 mb-5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span>Rs {fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Total</span>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      Rs {fmt(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="block w-full text-center py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {selectedItems.length === 0
                    ? 'Select items to checkout'
                    : `Checkout (${selected.size} item${selected.size !== 1 ? 's' : ''}) →`}
                </button>

                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <TrustBadge icon="🔒" text="Secure checkout" />
                  <TrustBadge icon="🚚" text="Free delivery on all orders" />
                  <TrustBadge icon="↩️" text="Easy returns within 30 days" />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}