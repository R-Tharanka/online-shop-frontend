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
            background: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: "#92400e",
            }}>
              Low Stock Alert: {lowStock.length} product{lowStock.length > 1 ? "s" : ""} need restocking
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#b45309",
              background: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: 6,
              padding: "4px 12px",
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
                fontSize: 18, color: "#b45309", opacity: 0.8, lineHeight: 1, padding: 4
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
              <h3 style={{ margin: 0, color: "#111827", fontSize: 24, fontWeight: 700 }}>
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
                      <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>
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
          { label: "Total Products", value: stats.total, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, color: "#374151" },
          { label: "In Stock", value: stats.inStock, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, color: "#10b981" },
          { label: "Catalogue Value", value: `Rs ${stats.totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, color: "#374151" },
          { label: "Categories", value: stats.categories, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, color: "#374151" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 12, padding: "20px 24px",
            border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ marginBottom: 16, color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: 28, color: "#111827", fontWeight: 700, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8, fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}