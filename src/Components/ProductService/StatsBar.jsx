import { useState } from "react";

export default function StatsBar({ products }) {
  const [dismissed, setDismissed] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stockQuantity > 0).length,
    totalValue: products.reduce((s, p) => s + p.price * p.stockQuantity, 0),
    categories: [...new Set(products.map(p => p.category))].length,
  };

  const lowStock = products.filter(p => p.stockQuantity <= 10);
  const sortedLowStock = [...lowStock].sort((a, b) => a.stockQuantity - b.stockQuantity);

  return (
    <>
      {/* ── low stock alert ─────────────────────────────────────────────── */}
      {lowStock.length > 0 && !dismissed && (
        <div
          onClick={() => setShowLowStockModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setShowLowStockModal(true);
            }
          }}
          style={{
            background: "linear-gradient(135deg, rgba(255,247,237,0.9), rgba(255,243,224,0.9))",
            border: "1.5px solid rgba(245,158,11,.45)",
            borderRadius: 18,
            padding: "14px 18px",
            marginBottom: 20,
            boxShadow: "0 12px 28px rgba(245,158,11,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
              color: "#b45309", letterSpacing: 1, textTransform: "uppercase",
            }}>
              Low Stock Alert: {lowStock.length} product{lowStock.length > 1 ? "s" : ""} need restocking
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#92400e",
              background: "rgba(255,255,255,.8)",
              border: "1px solid rgba(245,158,11,.35)",
              borderRadius: 999,
              padding: "4px 10px",
              whiteSpace: "nowrap",
            }}>
              View details
            </span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setDismissed(true);
              }}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 16, color: "#b45309", opacity: 0.6, lineHeight: 1,
              }}
              aria-label="Dismiss low stock alert"
            >✕</button>
          </div>
        </div>
      )}

      {showLowStockModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 0, 20, .62)",
            backdropFilter: "blur(5px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowLowStockModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(920px, 100%)",
              maxHeight: "85vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 18,
              border: "1px solid rgba(31,27,46,.08)",
              boxShadow: "0 24px 70px rgba(31,27,46,.22)",
              padding: "20px 20px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: "#1a002e", fontSize: 26 }}>
                Low Stock Products
              </h3>
              <button
                onClick={() => setShowLowStockModal(false)}
                style={{
                  border: "1.5px solid rgba(31,27,46,.16)",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Close
              </button>
            </div>

            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 0, marginBottom: 14 }}>
              {sortedLowStock.length} product{sortedLowStock.length > 1 ? "s" : ""} currently have 10 or fewer units.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedLowStock.map((product) => (
                <div
                  key={product._id}
                  style={{
                    border: "1px solid rgba(31,27,46,.08)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: "rgba(250,250,252,.95)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#1f1b2e" }}>
                        {product.productName}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                        {product.brand} • {product.category}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: product.stockQuantity === 0 ? "#ef4444" : "#b45309",
                      background: product.stockQuantity === 0 ? "#fef2f2" : "#fffbeb",
                      border: product.stockQuantity === 0 ? "1px solid rgba(239,68,68,.25)" : "1px solid rgba(245,158,11,.35)",
                      borderRadius: 999,
                      padding: "5px 10px",
                      whiteSpace: "nowrap",
                    }}>
                      {product.stockQuantity === 0 ? "Out of stock" : `${product.stockQuantity} in stock`}
                    </div>
                  </div>

                  <p style={{ margin: "10px 0 0", fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>
                    {product.description || "No description available."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── stat tiles ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Products", value: stats.total, icon: "📦", color: "#8200db" },
          { label: "In Stock", value: stats.inStock, icon: "✅", color: "#22c55e" },
          { label: "Catalogue Value", value: `Rs ${stats.totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: "💰", color: "#f59e0b" },
          { label: "Categories", value: stats.categories, icon: "🏷️", color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.95)", borderRadius: 18, padding: "20px 22px",
            border: "1px solid rgba(31,27,46,.08)", boxShadow: "0 12px 24px rgba(31,27,46,.06)",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: s.color, fontWeight: 700, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}