import { useState } from "react";

export default function ProductCard({ product, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        boxShadow: hovered ? "0 12px 40px rgba(130,0,219,.2)" : "0 2px 12px rgba(0,0,0,.07)",
        transition: "all .25s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        border: "1px solid #f0e8fc",
      }}
    >
      {/* image strip */}
      <div style={{
        height: 140,
        background: "linear-gradient(135deg, #f3e8ff, #e8f9ff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.4 }}>📦</span>
        )}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "#8200db", color: "#fff", borderRadius: 20,
          padding: "3px 10px", fontFamily: "'DM Mono', monospace",
          fontSize: 10, letterSpacing: 1,
        }}>
          {product.category}
        </div>
      </div>

      {/* content */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
          {product.brand}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#1a002e", margin: "0 0 4px", lineHeight: 1.3 }}>
          {product.productName}
        </h3>

        {/* sizes */}
        {product.size?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
            {product.size.map(s => (
              <span key={s} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                border: "1px solid #e0d0f7", borderRadius: 4,
                padding: "2px 7px", color: "#8200db",
              }}>{s}</span>
            ))}
          </div>
        )}

        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666",
          lineHeight: 1.5, margin: "0 0 14px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#8200db", fontWeight: 700 }}>
            Rs{Number(product.price).toFixed(2)}
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: product.stockQuantity > 10 ? "#22c55e" : product.stockQuantity > 0 ? "#f59e0b" : "#ef4444",
            background: product.stockQuantity > 10 ? "#f0fdf4" : product.stockQuantity > 0 ? "#fffbeb" : "#fef2f2",
            padding: "3px 10px", borderRadius: 20,
          }}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onEdit(product)} style={{
            flex: 1, padding: "9px", borderRadius: 8,
            border: "1.5px solid #e0d0f7", background: "#fff",
            color: "#8200db", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
          }}>
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(product)} style={{
            flex: 1, padding: "9px", borderRadius: 8,
            border: "1.5px solid #ffd0d8", background: "#fff",
            color: "#ff3a5e", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
          }}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}