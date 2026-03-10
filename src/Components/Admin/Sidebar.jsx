const PRODUCT_API_BASE = "http://localhost:5002/api/products";
const TOP_NAV_HEIGHT = 80;

export default function Sidebar({ activeSection = "products", onSelect, apiBase, isOpen = false, onClose }) {
  const items = [
    { key: "products", label: "Products" },
    { key: "orders", label: "Orders" },
    { key: "payments", label: "Payments" },
    { key: "users", label: "Users" },
    { key: "messages", label: "Messages" },
  ];
  const resolvedApiBase = apiBase || PRODUCT_API_BASE;

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => onClose && onClose()}
        />
      ) : null}
      <aside
        className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""}`}
        style={{
          position: "fixed",
          left: 0,
          top: TOP_NAV_HEIGHT,
          height: `calc(100vh - ${TOP_NAV_HEIGHT}px)`,
          width: 260,
          borderRadius: 0,
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(247,248,255,0.9) 60%, rgba(240,243,255,0.95) 100%)",
          borderRight: "1px solid rgba(31,27,46,0.08)",
          boxShadow: "0 10px 30px rgba(31, 27, 46, 0.06)",
          padding: "28px 0",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          overflow: "hidden",
          backdropFilter: "blur(12px)",
        }}
      >
        <style>{`
          .admin-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 10, 25, 0.35);
            border: none;
            z-index: 99;
          }
          @media (max-width: 1100px) {
            .admin-sidebar {
              top: 0 !important;
              height: 100vh !important;
              transform: translateX(-100%);
              transition: transform 0.2s ease;
              z-index: 100;
            }
            .admin-sidebar--open {
              transform: translateX(0);
            }
          }
        `}</style>
      <div style={{ padding: "0 26px 26px" }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            color: "#1f1b2e",
            letterSpacing: -0.5,
          }}
        >
          Veloura
        </div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(31,27,46,.55)",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Admin Studio
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 12px" }}>
        {items.map((item) => {
          const active = activeSection === item.key;
          return (
            <button
              type="button"
              key={item.label}
              onClick={() => onSelect && onSelect(item.key)}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                cursor: "pointer",
                background: active ? "rgba(95, 68, 255, 0.12)" : "transparent",
                border: active ? "1px solid rgba(95, 68, 255, 0.25)" : "1px solid transparent",
                color: active ? "#1f1b2e" : "rgba(31,27,46,.6)",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all .2s",
                width: "100%",
                textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? 600 : 500,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "0 24px",
        }}
      >
      </div>

      <div
        style={{
          marginTop: "auto",
          padding: "20px 24px",
          borderTop: "1px solid rgba(31,27,46,.08)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "rgba(31,27,46,.45)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          API
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(31,27,46,.6)",
            wordBreak: "break-all",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {resolvedApiBase}
        </div>
      </div>
      </aside>
    </>
  );
}
