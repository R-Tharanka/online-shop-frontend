import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_PRODUCT_API_BASE || "http://localhost:5002/api/products";

export default function ProductUserItem() {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setFetching(false));
  }, []);

  const filtered = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>

      {/* Hero Banner */}
      <div style={{
        background: "#1f1b2e",
        padding: "60px 40px",
        textAlign: "center",
      }}>
        {/* Brand */}
        <div style={{
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: 2,
          color: "#fff",
          marginBottom: 8,
        }}>
          Veloura
        </div>
        <p style={{
          color: "#9ca3af",
          fontSize: 16,
          margin: "0 0 32px",
          fontWeight: 400,
        }}>
          Discover · Style · Own
        </p>

        {/* Search Bar */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: 12,
          padding: "8px 16px",
          width: "100%",
          maxWidth: 500,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand or category..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "#111827",
              background: "transparent",
              padding: "8px 14px",
              fontWeight: 400,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                cursor: "pointer",
                color: "#4b5563",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{
        display: "flex",
        gap: 12,
        padding: "24px 40px 8px",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {["All", "Women", "Men", "Kids", "Accessories", "Sale"].map((tag) => (
          <span key={tag} style={{
            background: "#fff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "all .2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
          >{tag}</span>
        ))}
      </div>

      <div style={{ padding: "32px 40px 60px" }}>
        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <h2 style={{ margin: 0, color: "#111827", fontSize: 24, fontWeight: 700 }}>All Products</h2>
          <span style={{
            background: "#f3f4f6",
            color: "#4b5563",
            borderRadius: 12,
            padding: "4px 12px",
            fontSize: 13,
            fontWeight: 600,
          }}>{filtered.length}</span>
        </div>

        {fetching ? (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ color: "#6b7280", fontSize: 16, fontWeight: 500 }}>Loading products...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ color: "#4b5563", fontSize: 18, fontWeight: 500 }}>No products found</div>
            <div style={{ color: "#9ca3af", fontSize: 14, marginTop: 8 }}>Try adjusting your search criteria</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {filtered.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                style={{
                  width: 260,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all .2s ease",
                  border: "1px solid #e5e7eb",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: 320, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No Image</div>
                  )}
                  {/* Category badge */}
                  {product.category && (
                    <span style={{
                      position: "absolute", top: 12, left: 12,
                      background: "rgba(255,255,255,0.95)",
                      color: "#374151",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      border: "1px solid #e5e7eb"
                    }}>{product.category}</span>
                  )}
                  {/* New badge (optional) */}
                  <span style={{
                    position: "absolute", top: 12, right: 12,
                    background: "#1f1b2e",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}>NEW</span>
                </div>

                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>
                    {product.brand}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "#111827", marginBottom: 8, lineHeight: 1.4 }}>
                    {product.productName}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.5, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {product.description}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#1f1b2e",
                    }}>
                      Rs {Number(product.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
