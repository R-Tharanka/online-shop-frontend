import { useState } from "react";

export default function ProductCard({ product, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", 
        borderRadius: 12, 
        overflow: "hidden",
        boxShadow: hovered ? "0 10px 25px -5px rgba(0,0,0,.05), 0 8px 10px -6px rgba(0,0,0,.01)" : "0 1px 3px rgba(0,0,0,.05)",
        transition: "all .2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        border: "1px solid #e5e7eb",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
    >
      {/* image strip */}
      <div style={{
        height: 160,
        background: "#f9fafb",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid #e5e7eb"
      }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <span style={{ fontSize: 40, opacity: 0.2 }}>Image</span>
        )}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,0.9)", color: "#374151", borderRadius: 6,
          padding: "4px 8px", 
          fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
          border: "1px solid #e5e7eb"
        }}>
          {product.category}
        </div>
      </div>

      {/* content */}
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>
          {product.brand}
        </div>
        <h3 style={{ fontSize: 16, color: "#111827", margin: "0 0 6px", lineHeight: 1.4, fontWeight: 600 }}>
          {product.productName}
        </h3>

        {/* sizes */}
        {product.size?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {product.size.map(s => (
              <span key={s} style={{
                fontSize: 11,
                border: "1px solid #e5e7eb", borderRadius: 4,
                padding: "2px 6px", color: "#4b5563", background: "#f9fafb"
              }}>{s}</span>
            ))}
          </div>
        )}

        <p style={{
          fontSize: 13, color: "#4b5563",
          lineHeight: 1.5, margin: "0 0 16px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 18, color: "#1f1b2e", fontWeight: 700 }}>
            Rs {Number(product.price).toFixed(2)}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: product.stockQuantity > 10 ? "#059669" : product.stockQuantity > 0 ? "#d97706" : "#dc2626",
            background: product.stockQuantity > 10 ? "#d1fae5" : product.stockQuantity > 0 ? "#fef3c7" : "#fee2e2",
            padding: "4px 8px", borderRadius: 6,
          }}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onEdit(product)} style={{
            flex: 1, padding: "8px", borderRadius: 8,
            border: "1px solid #e5e7eb", background: "#fff",
            color: "#374151", cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            transition: "all .15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            Edit
          </button>
          <button onClick={() => onDelete(product)} style={{
            flex: 1, padding: "8px", borderRadius: 8,
            border: "1px solid #fee2e2", background: "#fff",
            color: "#dc2626", cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            transition: "all .15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}