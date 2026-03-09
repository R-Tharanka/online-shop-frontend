import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/cart`)
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setLoading(false);
      })
      .catch(() => setError('Failed to load cart'));
  }, []);

  const updateQuantity = (productId, quantity) => {
    fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })
      .then(res => res.json())
      .then(data => setCart(data));
  };

  const removeItem = (productId) => {
    fetch(`${API_BASE}/cart/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
      .then(res => res.json())
      .then(data => setCart(data));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32 text-purple-600 text-lg font-medium">
        Loading cart...
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto mt-12 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
        {error}
      </div>
    );

  const total = cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">🛒 Your Cart</h2>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-xl font-medium">Your cart is empty</p>
          <p className="text-sm mt-2">Add some items to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cart.items.map(item => (
              <div
                key={item.productId}
                className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Product ID</p>
                  <p className="text-purple-700 font-mono text-sm">{item.productId}</p>
                  {item.price && (
                    <p className="text-gray-500 text-sm mt-1">${item.price.toFixed(2)} each</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-30 font-bold text-lg flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Order total</p>
              <p className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</p>
            </div>
            <Link
              to="/checkout"
              className="px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors"
            >
              Proceed to Checkout →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
