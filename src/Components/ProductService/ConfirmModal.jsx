export default function ConfirmModal({ open, onConfirm, onCancel, productName }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,0,20,.65)",
      backdropFilter: "blur(6px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "36px 40px",
        maxWidth: 400, textAlign: "center",
        boxShadow: "0 20px 60px rgba(130,0,219,.25)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8, color: "#1a002e" }}>
          Delete product?
        </h3>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#666", marginBottom: 28 }}>
          <strong>{productName}</strong> will be permanently removed.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onCancel} style={{
            padding: "10px 24px", borderRadius: 8, border: "1.5px solid #ddd",
            background: "#fff", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 13,
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "10px 24px", borderRadius: 8, border: "none",
            background: "#ff3a5e", color: "#fff", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
          }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}