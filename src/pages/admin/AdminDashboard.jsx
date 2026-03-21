import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../../Components/Admin/Sidebar";
import StatsBar from "../../Components/ProductService/StatsBar";
import ProductCard from "../../Components/ProductService/ProductCard";
import ProductForm from "../../Components/ProductService/ProductForm";
import ConfirmModal from "../../Components/ProductService/ConfirmModal";
import Toast from "../../Components/ProductService/Toast";
import UserManagement from "../../Components/Admin/UserManagement";
import AdminOrders from "../../Components/Admin/AdminOrders";
import { getTokens } from "../../Components/Auth/authStorage";
import * as authApi from "../../Components/Auth/authApi";
import menuIcon from "../../assets/menu.png";

const PRODUCT_API_BASE = import.meta.env.VITE_PRODUCT_API_BASE || "http://localhost:5002/api/products";
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_BASE || "http://localhost:5000/api/auth";
const CONTACT_API_BASE = import.meta.env.VITE_CONTACT_API_BASE || "http://localhost:3002/api/contact";

const getProductSortTimestamp = (product) => {
  const createdTime = product?.createdAt ? new Date(product.createdAt).getTime() : 0;
  if (Number.isFinite(createdTime) && createdTime > 0) return createdTime;

  // Fallback for MongoDB ObjectId ordering when createdAt is unavailable.
  const idPrefix = typeof product?._id === "string" ? product._id.slice(0, 8) : "";
  const parsed = Number.parseInt(idPrefix, 16);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortProductsNewestFirst = (items) =>
  [...items].sort((a, b) => getProductSortTimestamp(b) - getProductSortTimestamp(a));

const initialForm = {
  productName: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  stockQuantity: "",
  size: [],
  imageFile: null,
  imagePreview: "",
  imageUrl: "",
};

export default function AdminDashboard() {
  const [section, setSection] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [view, setView] = useState("grid");
  const [usersTotal, setUsersTotal] = useState(null);
  const [ordersTotal, setOrdersTotal] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const accessToken = getTokens().accessToken;

  const unresolvedMessages = useMemo(
    () => messages.filter((message) => !message.isResolved).length,
    [messages]
  );

  const addToast = useCallback((msg, type = "success") => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(PRODUCT_API_BASE);
      const data = await res.json();
      setProducts(sortProductsNewestFirst(Array.isArray(data) ? data : []));
    } catch {
      addToast("Failed to fetch products", "error");
    } finally {
      setFetching(false);
    }
  }, [addToast]);

  const fetchUsersSummary = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await authApi.listUsers({
        accessToken,
        page: 1,
        limit: 1,
      });
      setUsersTotal(Number(data.total || 0));
    } catch (error) {
      addToast(error?.message || "Failed to load users", "error");
    }
  }, [accessToken, addToast]);

  const fetchMessages = useCallback(async () => {
    if (!accessToken) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(CONTACT_API_BASE, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load messages");
      }
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      addToast(error?.message || "Failed to load messages", "error");
    } finally {
      setMessagesLoading(false);
    }
  }, [accessToken, addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchUsersSummary(); }, [fetchUsersSummary]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Auto-refresh products every 30s so stock changes from purchases are reflected
  useEffect(() => {
    const interval = setInterval(() => fetchProducts(), 30000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  const handleFormChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm(initialForm);
    setEditId(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      productName: p.productName,
      description: p.description,
      price: p.price,
      category: p.category,
      brand: p.brand,
      stockQuantity: p.stockQuantity,
      size: Array.isArray(p.size) ? p.size : [],
      imageFile: null,
      imagePreview: "",
      imageUrl: p.imageUrl || "",
    });
    setEditId(p._id);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const required = ["productName", "description", "price", "category", "brand", "stockQuantity"];
    if (required.some(k => !form[k])) return addToast("Please fill all required fields", "error");
    if (!Array.isArray(form.size) || form.size.length === 0) return addToast("Please select at least one size", "error");

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);
    if (!Number.isFinite(price) || price <= 0) {
      return addToast("Price must be a positive value", "error");
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity <= 0) {
      return addToast("Stock quantity must be a positive whole number", "error");
    }

    setLoading(true);
    try {
      // Use FormData to support file upload
      const fd = new FormData();
      fd.append("productName", form.productName);
      fd.append("description", form.description);
      fd.append("price", price);
      fd.append("category", form.category);
      fd.append("brand", form.brand);
      fd.append("stockQuantity", stockQuantity);
      fd.append("size", JSON.stringify(form.size));
      if (form.imageFile) {
        fd.append("image", form.imageFile);
      }

      const url = formMode === "create" ? PRODUCT_API_BASE : `${PRODUCT_API_BASE}/${editId}`;
      const method = formMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error();

      addToast(formMode === "create" ? "Product created ✅" : "Product updated ✅");
      setFormOpen(false);
      fetchProducts();
    } catch {
      addToast("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${PRODUCT_API_BASE}/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("Product deleted");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const handleResolveMessage = async (message) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${CONTACT_API_BASE}/${message.id}/resolve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to resolve message");
      }
      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id
            ? data?.data || { ...item, isResolved: true }
            : item
        )
      );
      addToast("Message marked as resolved", "success");
    } catch (error) {
      addToast(error?.message || "Failed to resolve message", "error");
    }
  };

  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  const filtered = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCards = useMemo(() => ([
    {
      key: "products",
      label: "Products",
      value: products.length,
      helper: `${products.length} listed`,
    },
    {
      key: "orders",
      label: "Orders",
      value: typeof ordersTotal === "number" ? ordersTotal : null,
      helper: typeof ordersTotal === "number" ? "All customer orders" : "Order service",
    },
    {
      key: "payments",
      label: "Payments",
      value: null,
      helper: "Connect payment service",
    },
    {
      key: "users",
      label: "Users",
      value: typeof usersTotal === "number" ? usersTotal : null,
      helper: typeof usersTotal === "number" ? "Active accounts" : "Auth service",
    },
    {
      key: "messages",
      label: "Messages",
      value: unresolvedMessages,
      helper: `${messages.length} total`,
    },
  ]), [messages.length, products.length, unresolvedMessages, usersTotal, ordersTotal]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 10%, rgba(255, 244, 217, 0.55), transparent 45%), radial-gradient(circle at 85% 20%, rgba(220, 230, 255, 0.6), transparent 55%), linear-gradient(120deg, #f9f7f4 0%, #f2f6ff 55%, #f8f1ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus, textarea:focus, select:focus { border-color: #1f1b2e !important; box-shadow: 0 0 0 3px rgba(207,194,255,.45); }
        button:hover { opacity: .96; }
        .admin-content { margin-left: 280px; padding: 48px 56px; }
        .admin-sidebar-toggle {
          display: none;
          margin-bottom: 18px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(31,27,46,.15);
          background: rgba(255,255,255,0.9);
          font-size: 12px;
          cursor: pointer;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 1100px) {
          .admin-content { margin-left: 0; padding: 32px 20px; }
          .admin-sidebar-toggle { display: inline-flex; align-items: center; }
        }
      `}</style>

      <Sidebar
        activeSection={section}
        onSelect={(next) => {
          setSection(next);
          setSidebarOpen(false);
        }}
        apiBase={
          section === "users"
            ? AUTH_BASE_URL
            : section === "messages"
              ? CONTACT_API_BASE
              : PRODUCT_API_BASE
        }
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-content">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="admin-sidebar-toggle"
          aria-label="Open admin navigation"
        >
          <img src={menuIcon} alt="" style={{ width: 16, height: 16 }} />
          Menu
        </button>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: "#1f1b2e", margin: 0, letterSpacing: -1 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "8px 0 0" }}>
              Manage products, users, and service operations in one place
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {section === "products" && (
              <button onClick={openCreate} style={{
                background: "#1f1b2e",
                color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px",
                cursor: "pointer", fontSize: 14, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 8,
                transition: "all .2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#2c2740"}
              onMouseLeave={e => e.currentTarget.style.background = "#1f1b2e"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                New Product
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 30,
          }}
        >
          {summaryCards.map((card) => (
            <div
              key={card.key}
              style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: 16,
                padding: "16px 18px",
                border: "1px solid rgba(31,27,46,.08)",
                boxShadow: "0 12px 24px rgba(31,27,46,.04)",
              }}
            >
              <div style={{ fontSize: 11, color: "rgba(31,27,46,.55)", letterSpacing: 2, textTransform: "uppercase" }}>
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 26,
                  color: "#1f1b2e",
                  marginTop: 6,
                }}
              >
                {typeof card.value === "number" ? card.value : "—"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(31,27,46,.5)", marginTop: 6 }}>
                {card.helper}
              </div>
            </div>
          ))}
        </div>

        {section === "products" ? (
          <>
            <StatsBar products={products} />

            {/* toolbar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: .45 }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  style={{
                    width: "100%", padding: "11px 14px 11px 40px", borderRadius: 12,
                    border: "1.5px solid rgba(31,27,46,.15)", fontSize: 13, background: "rgba(255,255,255,0.95)",
                    outline: "none", fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
              <button onClick={fetchProducts} style={{
                padding: "11px 18px", borderRadius: 12, border: "1.5px solid rgba(31,27,46,.15)",
                background: "rgba(255,255,255,0.9)", cursor: "pointer", fontSize: 13,
              }}>
                ↻ Refresh
              </button>
              <div style={{ display: "flex", border: "1.5px solid rgba(31,27,46,.15)", borderRadius: 12, overflow: "hidden" }}>
                {["grid", "list"].map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    padding: "10px 14px", border: "none",
                    background: view === v ? "#1f1b2e" : "rgba(255,255,255,0.9)",
                    color: view === v ? "#fff" : "#6b7280",
                    cursor: "pointer", fontSize: 14,
                  }}>
                    {v === "grid" ? "⊞" : "☰"}
                  </button>
                ))}
              </div>
            </div>

            {/* product list */}
            {fetching ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "3px solid #e8e0f7", borderTopColor: "#8200db",
                  animation: "spin 1s linear infinite", margin: "0 auto 16px",
                }} />
                <p style={{ color: "#999", fontSize: 13 }}>Loading products…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#1a002e", marginBottom: 8 }}>
                  No products found
                </p>
                <p style={{ fontSize: 13 }}>
                  {search ? "Try a different search term" : "Create your first product to get started"}
                </p>
              </div>
            ) : view === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {filtered.map(p => (
                  <ProductCard key={p._id} product={p} onEdit={openEdit} onDelete={setDeleteTarget} />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(p => (
                  <div key={p._id} style={{
                    background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: "16px 20px",
                    border: "1px solid rgba(31,27,46,.08)", display: "flex", alignItems: "center", gap: 20,
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 10,
                      background: "linear-gradient(135deg, #f3e8ff, #e8f2ff)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0, overflow: "hidden",
                    }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                        : "📦"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#1a002e", marginBottom: 2 }}>
                        {p.productName}
                      </div>
                      <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>{p.brand} · {p.category}</div>
                      {p.size?.length > 0 && (
                        <div style={{ display: "flex", gap: 4 }}>
                          {p.size.map(s => (
                            <span key={s} style={{
                              fontSize: 10, border: "1px solid #e0d0f7",
                              borderRadius: 4, padding: "1px 6px", color: "#8200db",
                              fontFamily: "'DM Mono', monospace",
                            }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#5f44ff", fontWeight: 700, minWidth: 80, textAlign: "right" }}>
                      Rs.{Number(p.price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: p.stockQuantity > 0 ? "#22c55e" : "#ef4444", minWidth: 80, textAlign: "center" }}>
                      {p.stockQuantity} units
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid rgba(95,68,255,.3)", background: "#fff", color: "#5f44ff", cursor: "pointer", fontSize: 12 }}>Edit</button>
                      <button onClick={() => setDeleteTarget(p)} style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid rgba(239,68,68,.3)", background: "#fff", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length > 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 11, marginTop: 28, letterSpacing: 1, textTransform: "uppercase" }}>
                Showing {filtered.length} of {products.length} products
              </p>
            )}
          </>
        ) : section === "users" ? (
          <UserManagement addToast={addToast} />
        ) : section === "messages" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#1f1b2e", margin: 0 }}>
                  Messages
                </h2>
                <p style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
                  Recent contact requests from customers
                </p>
              </div>
              <button onClick={fetchMessages} style={{
                padding: "10px 16px", borderRadius: 12, border: "1.5px solid rgba(31,27,46,.15)",
                background: "rgba(255,255,255,0.9)", cursor: "pointer", fontSize: 12,
              }}>
                ↻ Refresh
              </button>
            </div>

            {messagesLoading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "3px solid #e8e0f7", borderTopColor: "#8200db",
                  animation: "spin 1s linear infinite", margin: "0 auto 16px",
                }} />
                <p style={{ color: "#999", fontSize: 13 }}>Loading messages…</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📨</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#1a002e", marginBottom: 8 }}>
                  No messages yet
                </p>
                <p style={{ fontSize: 13 }}>Incoming messages will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: 16,
                      padding: "18px 20px",
                      border: "1px solid rgba(31,27,46,.08)",
                      display: "grid",
                      gridTemplateColumns: "1.2fr 2fr 1fr",
                      gap: 18,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#1f1b2e", fontSize: 13 }}>
                        {message.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                        {message.email}
                      </div>
                      {message.phone ? (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                          {message.phone}
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1f1b2e", fontSize: 13 }}>
                        {message.subject}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
                        {message.message}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{formatDate(message.createdAt)}</div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          marginTop: 8,
                          background: message.isResolved ? "rgba(34,197,94,.12)" : "rgba(251,146,60,.16)",
                          color: message.isResolved ? "#16a34a" : "#c2410c",
                        }}
                      >
                        {message.isResolved ? "Resolved" : "Open"}
                      </div>
                      <div>
                        <button
                          disabled={message.isResolved}
                          onClick={() => handleResolveMessage(message)}
                          style={{
                            marginTop: 10,
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "1.5px solid rgba(31,27,46,.12)",
                            background: message.isResolved ? "rgba(229,231,235,.8)" : "#1f1b2e",
                            color: message.isResolved ? "#9ca3af" : "#fff",
                            cursor: message.isResolved ? "not-allowed" : "pointer",
                            fontSize: 12,
                          }}
                        >
                          {message.isResolved ? "Resolved" : "Resolve"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : section === "orders" ? (
          <AdminOrders addToast={addToast} onTotalChange={setOrdersTotal} />
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "24px",
            border: "1px solid rgba(31,27,46,.08)",
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1f1b2e", marginTop: 0 }}>
              Payments
            </h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 0 }}>
              Connect the payment service to review transactions and refunds.
            </p>
          </div>
        )}
      </div>

      <ProductForm
        open={formOpen}
        mode={formMode}
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
        loading={loading}
      />
      <ConfirmModal
        open={!!deleteTarget}
        productName={deleteTarget?.productName}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toasts={toasts} />
    </div>
  );
}