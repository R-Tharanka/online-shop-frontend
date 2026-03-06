import { useState } from "react";

export default function StatsBar({ products }) {
  const [dismissed, setDismissed] = useState(false);

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stockQuantity > 0).length,
    totalValue: products.reduce((s, p) => s + p.price * p.stockQuantity, 0),
    categories: [...new Set(products.map(p => p.category))].length,
  };

  const lowStock = products.filter(p => p.stockQuantity <= 10);

  return (
    <>
      {/* ── low stock alert ─────────────────────────────────────────────── */}
      {lowStock.length > 0 && !dismissed && (
        <div style={{
          background: "linear-gradient(135deg, #fff7ed, #fff3e0)",
          border: "1.5px solid #f59e0b",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 20,
          boxShadow: "0 2px 12px rgba(245,158,11,.15)",
        }}>
          {/* header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
                color: "#b45309", letterSpacing: 1, textTransform: "uppercase",
              }}>
                Low Stock Alert — {lowStock.length} product{lowStock.length > 1 ? "s" : ""} need restocking
              </span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 16, color: "#b45309", opacity: 0.6, lineHeight: 1,
              }}
            >✕</button>
          </div>

          {/* alert rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {lowStock.map(p => (
              <div key={p._id} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(255,255,255,.7)", borderRadius: 8,
                padding: "9px 14px", border: "1px solid #fde68a",
              }}>
                <span style={{ fontSize: 14 }}>
                  {p.stockQuantity === 0 ? "🔴" : "🟡"}
                </span>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11,
                  color: "#78350f", flex: 1,
                }}>
                  <strong style={{ color: "#92400e" }}>ID:</strong> {p._id}
                  <span style={{ margin: "0 8px", opacity: 0.4 }}>|</span>
                  <strong style={{ color: "#92400e" }}>{p.productName}</strong>
                  <span style={{ margin: "0 8px", opacity: 0.4 }}>|</span>
                  Stock:{" "}
                  <strong style={{ color: p.stockQuantity === 0 ? "#ef4444" : "#f59e0b" }}>
                    {p.stockQuantity}
                  </strong>
                  <span style={{ margin: "0 8px", opacity: 0.4 }}>—</span>
                  <span style={{ color: "#b45309", fontStyle: "italic" }}>Please restock.</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── stat tiles ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Products", value: stats.total, icon: "📦", color: "#8200db" },
          { label: "In Stock", value: stats.inStock, icon: "✅", color: "#22c55e" },
          { label: "Catalogue Value", value: `$${stats.totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: "💰", color: "#f59e0b" },
          { label: "Categories", value: stats.categories, icon: "🏷️", color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 14, padding: "20px 22px",
            border: "1px solid #f0e8fc", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
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