import { useState, useEffect, useCallback } from "react";
import Sidebar from "../Components/ProductService/Sidebar";
import StatsBar from "../Components/ProductService/StatsBar";
import ProductCard from "../Components/ProductService/ProductCard";
import ProductForm from "../Components/ProductService/ProductForm";
import ConfirmModal from "../Components/ProductService/ConfirmModal";
import Toast from "../Components/ProductService/Toast";

const API_BASE = "http://localhost:5002/api/products";

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

export default function ProductServiceAdmin() {
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

  const addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setProducts(data);
    } catch {
      addToast("Failed to fetch products", "error");
    } finally {
      setFetching(false);
    }
  }, [addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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

    setLoading(true);
    try {
      // Use FormData to support file upload
      const fd = new FormData();
      fd.append("productName", form.productName);
      fd.append("description", form.description);
      fd.append("price", Number(form.price));
      fd.append("category", form.category);
      fd.append("brand", form.brand);
      fd.append("stockQuantity", Number(form.stockQuantity));
      fd.append("size", JSON.stringify(form.size));
      if (form.imageFile) {
        fd.append("image", form.imageFile);
      }

      const url = formMode === "create" ? API_BASE : `${API_BASE}/${editId}`;
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
      const res = await fetch(`${API_BASE}/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("Product deleted");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const filtered = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FBFBFB", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #8200db !important; box-shadow: 0 0 0 3px rgba(130,0,219,.12); }
        button:hover { opacity: .9; }
      `}</style>

      <Sidebar />

      <div style={{ marginLeft: 220, padding: "40px 40px" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#1a002e", margin: 0, letterSpacing: -1 }}>
              Product Catalogue
            </h1>
            <p style={{ color: "#999", fontSize: 12, margin: "6px 0 0", letterSpacing: 1 }}>
              Manage your product inventory
            </p>
          </div>
          <button onClick={openCreate} style={{
            background: "linear-gradient(135deg, #8200db, #b44fff)",
            color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px",
            cursor: "pointer", fontSize: 13, fontFamily: "'DM Mono', monospace",
            fontWeight: 700, boxShadow: "0 6px 24px rgba(130,0,219,.4)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>+</span> New Product
          </button>
        </div>

        <StatsBar products={products} />

        {/* toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: .5 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands, categories…"
              style={{
                width: "100%", padding: "11px 14px 11px 40px", borderRadius: 10,
                border: "1.5px solid #e8e0f7", fontSize: 13, background: "#fff",
                outline: "none", fontFamily: "'DM Mono', monospace",
              }}
            />
          </div>
          <button onClick={fetchProducts} style={{
            padding: "11px 18px", borderRadius: 10, border: "1.5px solid #e8e0f7",
            background: "#fff", cursor: "pointer", fontSize: 13,
          }}>
            ↻ Refresh
          </button>
          <div style={{ display: "flex", border: "1.5px solid #e8e0f7", borderRadius: 10, overflow: "hidden" }}>
            {["grid", "list"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "10px 14px", border: "none",
                background: view === v ? "#8200db" : "#fff",
                color: view === v ? "#fff" : "#666",
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
                background: "#fff", borderRadius: 12, padding: "16px 20px",
                border: "1px solid #f0e8fc", display: "flex", alignItems: "center", gap: 20,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10,
                  background: "linear-gradient(135deg, #f3e8ff, #e8f9ff)",
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
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#8200db", fontWeight: 700, minWidth: 80, textAlign: "right" }}>
                  Rs.{Number(p.price).toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: p.stockQuantity > 0 ? "#22c55e" : "#ef4444", minWidth: 80, textAlign: "center" }}>
                  {p.stockQuantity} units
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEdit(p)} style={{ padding: "7px 14px", borderRadius: 7, border: "1.5px solid #e0d0f7", background: "#fff", color: "#8200db", cursor: "pointer", fontSize: 12 }}>Edit</button>
                  <button onClick={() => setDeleteTarget(p)} style={{ padding: "7px 14px", borderRadius: 7, border: "1.5px solid #ffd0d8", background: "#fff", color: "#ff3a5e", cursor: "pointer", fontSize: 12 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p style={{ textAlign: "center", color: "#bbb", fontSize: 11, marginTop: 28, letterSpacing: 1, textTransform: "uppercase" }}>
            Showing {filtered.length} of {products.length} products
          </p>
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