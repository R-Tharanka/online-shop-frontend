import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

export default function Checkout() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    fetch(`${API_BASE}/order/create`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Checkout failed');
        setLoading(false);
      });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">💳 Checkout</h2>
      <p className="text-gray-500 mb-8">Review and confirm your order</p>

      {!order ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600 mb-6">Ready to complete your purchase?</p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 bg-purple-700 text-white rounded-xl font-semibold text-lg hover:bg-purple-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">✅</span>
            <div>
              <h3 className="text-xl font-bold text-green-700">Order Placed!</h3>
              <p className="text-gray-500 text-sm">Your order is confirmed</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-semibold text-gray-800">{order._id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-purple-700 text-base">${order.total}</span>
            </div>
          </div>
          <Link
            to="/order-details"
            className="mt-6 block text-center px-6 py-2 border border-purple-700 text-purple-700 rounded-xl hover:bg-purple-50 transition-colors font-medium"
          >
            View Order Details
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
