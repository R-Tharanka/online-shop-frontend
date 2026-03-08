import React, { useState } from 'react';

const API_BASE = 'http://localhost:5001/api';

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
};

export default function OrderDetails() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrder = () => {
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    fetch(`${API_BASE}/order/${orderId}`)
      .then(res => res.json())
      .then(data => { setOrder(data); setLoading(false); })
      .catch(() => { setError('Order not found'); setLoading(false); });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">📦 Order Details</h2>
      <p className="text-gray-500 mb-8">Look up an order by its ID</p>

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchOrder()}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={fetchOrder}
          disabled={loading}
          className="px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold text-sm hover:bg-purple-800 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center mb-6">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Order ID</p>
              <p className="font-mono font-semibold text-gray-800 text-sm">{order._id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-50">
                <div>
                  <span className="text-gray-500">Product </span>
                  <span className="font-mono text-gray-800">{item.productId}</span>
                </div>
                <span className="text-gray-600">Qty: <strong>{item.quantity}</strong></span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Order Total</span>
            <span className="text-xl font-bold text-purple-700">${order.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
