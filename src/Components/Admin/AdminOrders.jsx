import { useState, useEffect, useCallback } from "react";
import { getAllOrdersAdmin, updateOrderStatusAdmin } from "../../pages/orders/orderApi";

const STATUS_CFG = {
  pending:    { bg: 'rgba(251,191,36,.15)', color: '#b45309', border: 'rgba(251,191,36,.5)',    icon: '🕐', label: 'Pending'    },
  processing: { bg: 'rgba(59,130,246,.12)',  color: '#1d4ed8', border: 'rgba(59,130,246,.4)',   icon: '⚙️', label: 'Processing' },
  shipped:    { bg: 'rgba(99,102,241,.12)',  color: '#4338ca', border: 'rgba(99,102,241,.4)',   icon: '🚚', label: 'Shipped'    },
  delivered:  { bg: 'rgba(34,197,94,.12)',   color: '#16a34a', border: 'rgba(34,197,94,.4)',    icon: '✅', label: 'Delivered'  },
  cancelled:  { bg: 'rgba(239,68,68,.12)',   color: '#dc2626', border: 'rgba(239,68,68,.4)',    icon: '❌', label: 'Cancelled'  },
};

const TIMELINE_STEPS = [
  { key: 'pending',    icon: '🕐', label: 'Pending' },
  { key: 'processing', icon: '⚙️', label: 'Processing' },
  { key: 'shipped',    icon: '🚚', label: 'Shipped' },
  { key: 'delivered',  icon: '✅', label: 'Delivered' },
];
const STEP_INDEX = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 10,
        background: 'rgba(239,68,68,.07)', marginBottom: 14,
      }}>
        <span style={{ fontSize: 18 }}>❌</span>
        <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Order Cancelled</span>
      </div>
    );
  }
  const current = STEP_INDEX[status] ?? 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <>
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done ? '#22c55e' : active ? '#5f44ff' : 'rgba(31,27,46,.06)',
                color: done || active ? '#fff' : '#9ca3af',
                border: done || active ? 'none' : '2px solid rgba(31,27,46,.12)',
                flexShrink: 0,
              }}>
                {done ? '✓' : step.icon}
              </div>
              <span style={{
                fontSize: 8, marginTop: 4, textAlign: 'center',
                maxWidth: 44, lineHeight: 1.3, fontWeight: 600,
                color: active ? '#1f1b2e' : done ? '#16a34a' : '#9ca3af',
              }}>
                {step.label}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 14, marginLeft: 2, marginRight: 2,
                borderRadius: 4,
                background: i < current ? '#22c55e' : 'rgba(31,27,46,.09)',
                transition: 'background .3s',
              }} />
            )}
          </>
        );
      })}
    </div>
  );
}

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const LIMIT = 15;

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', icon: '•', label: status };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function AdminOrders({ addToast, onTotalChange }) {
  const [orders, setOrders]               = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [authError, setAuthError]         = useState(false);
  const [fetchError, setFetchError]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [searchInput, setSearchInput]     = useState('');
  const [search, setSearch]               = useState('');
  const [page, setPage]                   = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId]       = useState(null);

  // Debounce search input → search state
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchOrders = useCallback(async (signal) => {
    setLoading(true);
    setAuthError(false);
    setFetchError('');
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await getAllOrdersAdmin(params);
      if (signal?.aborted) return;
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      if (typeof onTotalChange === 'function') onTotalChange(data.total || 0);
    } catch (err) {
      if (signal?.aborted) return;
      if (err.status === 401 || err.status === 403) {
        setAuthError(true);
      } else {
        setFetchError(err.message || 'Failed to fetch orders');
        addToast(err.message || 'Failed to fetch orders', 'error');
      }
      setOrders([]);
      setTotal(0);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, statusFilter, search, addToast, onTotalChange]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (updatingId) return;
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatusAdmin(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(updated);
      addToast(`Status updated to "${newStatus}"`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const fmt       = (n) => (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const totalPages = Math.ceil(total / LIMIT);
  const panelOpen  = !!selectedOrder;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1f1b2e', margin: 0 }}>
            Order Management
          </h2>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
            {total} order{total !== 1 ? 's' : ''} · View and manage all customer orders
          </p>
        </div>
        <button
          onClick={() => fetchOrders()}
          style={{
            padding: '10px 16px', borderRadius: 12, border: '1.5px solid rgba(31,27,46,.15)',
            background: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Auth / session error ────────────────────────────────────────────── */}
      {authError && (
        <div style={{
          background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.25)',
          borderRadius: 14, padding: '24px 28px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1f1b2e', margin: '0 0 6px' }}>
            Session Expired
          </p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>
            Your session has expired or you do not have permission to view orders.
            Please log in again with a shop owner account.
          </p>
          <button
            onClick={() => fetchOrders()}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #1f1b2e, #5f44ff)', color: '#fff',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Status filter tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        <button
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          style={{
            padding: '7px 16px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            border: statusFilter === 'all' ? '2px solid #1f1b2e' : '1.5px solid rgba(31,27,46,.15)',
            background: statusFilter === 'all' ? '#1f1b2e' : 'rgba(255,255,255,0.95)',
            color: statusFilter === 'all' ? '#fff' : '#374151',
          }}
        >
          All Orders
        </button>
        {ALL_STATUSES.map(s => {
          const cfg    = STATUS_CFG[s];
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                border: active ? `2px solid ${cfg.color}` : '1.5px solid rgba(31,27,46,.15)',
                background: active ? cfg.bg : 'rgba(255,255,255,0.95)',
                color: active ? cfg.color : '#374151',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .4 }}>
          🔍
        </span>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by Order ID or Customer ID…"
          style={{
            width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12, boxSizing: 'border-box',
            border: '1.5px solid rgba(31,27,46,.15)', fontSize: 13, background: 'rgba(255,255,255,0.95)',
            outline: 'none', fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      {/* ── Main layout: table + detail panel ─────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: panelOpen ? 'minmax(0, 1fr) 390px' : '1fr',
        gap: 20, alignItems: 'start',
      }}>

        {/* ── Orders table ───────────────────────────────────────────────── */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid #e8e0f7', borderTopColor: '#8200db',
                animation: 'spin 1s linear infinite', margin: '0 auto 16px',
              }} />
              <p style={{ color: '#999', fontSize: 13 }}>Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1a002e', marginBottom: 8 }}>
                No orders found
              </p>
              <p style={{ fontSize: 13 }}>Try a different filter or search term</p>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.97)', borderRadius: 16,
              border: '1px solid rgba(31,27,46,.08)', overflow: 'hidden',
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: panelOpen
                  ? '1.5fr 1.1fr 0.9fr 0.5fr 1fr 1.2fr'
                  : '2fr 1.6fr 1fr 0.6fr 1.2fr 1.5fr',
                padding: '12px 20px', gap: 8,
                borderBottom: '1px solid rgba(31,27,46,.07)',
                background: 'rgba(31,27,46,.03)',
                fontSize: 10, fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                <span>Order ID</span>
                <span>Customer</span>
                <span>Date</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
              </div>

              {orders.map((order, i) => {
                const date     = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const isActive = selectedOrder?._id === order._id;
                const cols     = panelOpen
                  ? '1.5fr 1.1fr 0.9fr 0.5fr 1fr 1.2fr'
                  : '2fr 1.6fr 1fr 0.6fr 1.2fr 1.5fr';
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(isActive ? null : order)}
                    style={{
                      display: 'grid', gridTemplateColumns: cols, gap: 8,
                      padding: '14px 20px', cursor: 'pointer', alignItems: 'center',
                      borderBottom: i < orders.length - 1 ? '1px solid rgba(31,27,46,.05)' : 'none',
                      background: isActive ? 'rgba(95,68,255,.04)' : 'transparent',
                      borderLeft: isActive ? '3px solid #5f44ff' : '3px solid transparent',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(31,27,46,.015)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#5f44ff', fontWeight: 600 }}>
                      #{order._id.slice(-10).toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 10, color: '#6b7280', fontFamily: 'monospace',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {order.userId}
                    </span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{date}</span>
                    <span style={{ fontSize: 12, color: '#1f1b2e', fontWeight: 600 }}>
                      {order.items?.length ?? 0}
                    </span>
                    <span style={{ fontSize: 12, color: '#1f1b2e', fontWeight: 700 }}>
                      Rs {fmt(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(31,27,46,.15)',
                  background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(31,27,46,.15)',
                  background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* ── Detail Panel ───────────────────────────────────────────────── */}
        {panelOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.98)', borderRadius: 16,
            border: '1px solid rgba(31,27,46,.1)', padding: 22,
            animation: 'slideIn .18s ease-out',
            position: 'sticky', top: 96,
            maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
          }}>
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#1f1b2e', margin: 0 }}>
                Order Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  border: 'none', background: 'rgba(31,27,46,.07)', borderRadius: 8,
                  cursor: 'pointer', fontSize: 16, color: '#6b7280',
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Order meta */}
            <div style={{ padding: '10px 12px', background: 'rgba(95,68,255,.04)', borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Order ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5f44ff', fontWeight: 600, marginTop: 2, wordBreak: 'break-all' }}>
                {selectedOrder._id}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Placed</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>
                    {new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Payment</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>
                    {selectedOrder.paymentMethod === 'card' ? '💳 Card' : '💵 Cash on Delivery'}
                  </div>
                </div>
              </div>
            </div>

            {/* Order progress timeline */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
                Order Progress
              </div>
              <OrderTimeline status={selectedOrder.status} />
            </div>

            {/* Customer ID */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>
                Customer ID
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151', wordBreak: 'break-all' }}>
                {selectedOrder.userId}
              </div>
            </div>

            {/* Status update */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
                Update Status
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALL_STATUSES.map(s => {
                  const cfg       = STATUS_CFG[s];
                  const active    = selectedOrder.status === s;
                  const isUpdating = updatingId === selectedOrder._id;
                  return (
                    <button
                      key={s}
                      onClick={() => !active && !isUpdating && handleStatusUpdate(selectedOrder._id, s)}
                      disabled={active || isUpdating}
                      style={{
                        padding: '5px 11px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                        cursor: active || isUpdating ? 'default' : 'pointer',
                        border: active ? `2px solid ${cfg.color}` : '1.5px solid rgba(31,27,46,.12)',
                        background: active ? cfg.bg : '#fff',
                        color: active ? cfg.color : '#6b7280',
                        opacity: isUpdating && !active ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {cfg.icon} {cfg.label}
                      {active && <span style={{ fontSize: 8, marginLeft: 2 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {updatingId === selectedOrder._id && (
                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>Updating status…</p>
              )}
            </div>

            {/* Items list */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
                Items ({selectedOrder.items?.length ?? 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, background: 'rgba(31,27,46,.025)',
                  }}>
                    <img
                      src={item.imageUrl || 'https://placehold.co/40x40?text=?'}
                      alt={item.productName}
                      onError={e => { e.target.src = 'https://placehold.co/40x40?text=?'; }}
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(31,27,46,.08)', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1f1b2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.productName || item.productId}
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                        {item.selectedSize ? `Size: ${item.selectedSize} · ` : ''}Qty: {item.quantity} · Rs {fmt(item.price)}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#5f44ff', flexShrink: 0 }}>
                      Rs {fmt((item.price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order total */}
            <div style={{ background: 'rgba(31,27,46,.03)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontSize: 12, color: '#374151' }}>Rs {fmt(selectedOrder.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Shipping</span>
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(31,27,46,.08)', paddingTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1f1b2e' }}>Total</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#5f44ff' }}>Rs {fmt(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Shipping address */}
            {selectedOrder.shippingAddress?.fullName && (
              <div style={{ background: 'rgba(31,27,46,.03)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
                  📦 Ship To
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                  {selectedOrder.shippingAddress.fullName}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  {selectedOrder.shippingAddress.address}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {selectedOrder.shippingAddress.city}
                  {selectedOrder.shippingAddress.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}
                </div>
                {selectedOrder.shippingAddress.phone && (
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {selectedOrder.shippingAddress.phone}
                  </div>
                )}
              </div>
            )}

            {/* Payment method */}
            {selectedOrder.paymentMethod && (
              <div style={{ background: 'rgba(31,27,46,.03)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
                  💳 Payment Method
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                  {selectedOrder.paymentMethod === 'card' ? '💳 Credit / Debit Card' : '💵 Cash on Delivery'}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  {selectedOrder.paymentMethod === 'card' ? 'Processed at checkout' : 'Pay when received'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
