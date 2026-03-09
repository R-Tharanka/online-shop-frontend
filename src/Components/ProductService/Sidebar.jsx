const PRODUCT_API_BASE = "http://localhost:5002/api/products";

export default function Sidebar({ activeSection = "products", onSelect, apiBase }) {
  const items = [
    { key: "products", icon: "📦", label: "Products" },
    { key: "users", icon: "👥", label: "Users" },
  ];
  const resolvedApiBase = apiBase || PRODUCT_API_BASE;

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
      background: "linear-gradient(180deg, #1a002e 0%, #2d0050 100%)",
      padding: "32px 0", display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#fff", letterSpacing: -0.5 }}>
          Veloura
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>
          Admin Panel
        </div>
      </div>

      {items.map(item => {
        const active = activeSection === item.key;
        return (
        <button
          type="button"
          key={item.label}
          onClick={() => onSelect && onSelect(item.key)}
          style={{
          padding: "12px 24px", margin: "2px 12px", borderRadius: 10, cursor: "pointer",
          background: active ? "rgba(130,0,219,.4)" : "transparent",
          borderLeft: active ? "3px solid #b44fff" : "3px solid transparent",
          color: active ? "#fff" : "rgba(255,255,255,.5)",
          fontSize: 13, display: "flex", alignItems: "center", gap: 10,
          transition: "all .2s",
          width: "calc(100% - 24px)",
          border: "none",
          textAlign: "left",
        }}>
          <span>{item.icon}</span>{item.label}
        </button>
      );
      })}

      <div style={{ marginTop: "auto", padding: "24px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>API</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", wordBreak: "break-all" }}>{resolvedApiBase}</div>
      </div>
    </div>
  );
}