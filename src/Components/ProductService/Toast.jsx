export default function Toast({ toasts }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#ff3a5e" : "#8200db",
          color: "#fff", padding: "12px 20px", borderRadius: 8,
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          boxShadow: "0 4px 24px rgba(130,0,219,.35)",
          animation: "slideIn .25s ease", maxWidth: 300,
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}