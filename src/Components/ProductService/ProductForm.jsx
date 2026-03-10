import { useState, useRef } from "react";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductForm({ open, mode, form, onChange, onSubmit, onClose, loading }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const textFields = [
    { key: "productName", label: "Product Name", type: "text", required: true },
    { key: "brand", label: "Brand", type: "text", required: true },
    { key: "category", label: "Category", type: "text", required: true },
    { key: "price", label: "Price (Rs)", type: "number", required: true },
    { key: "stockQuantity", label: "Stock Quantity", type: "number", required: true },
  ];

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px",
    borderRadius: 8, border: "1.5px solid #e0d0f7",
    fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#1a002e",
    background: "#fff", outline: "none", transition: "border .2s",
  };

  // ── image handling ──────────────────────────────────────────────────────
  const handleFileChange = (file) => {
    if (!file) return;
    onChange("imageFile", file);
    onChange("imagePreview", URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileChange(file);
  };

  const removeImage = () => {
    onChange("imageFile", null);
    onChange("imagePreview", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── size handling ───────────────────────────────────────────────────────
  const toggleSize = (s) => {
    const current = Array.isArray(form.size) ? form.size : [];
    const updated = current.includes(s)
      ? current.filter(x => x !== s)
      : [...current, s];
    onChange("size", updated);
  };

  const previewSrc = form.imagePreview || form.imageUrl || null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,0,20,.6)",
      backdropFilter: "blur(8px)", zIndex: 900,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#FBFBFB", borderRadius: 20, width: "100%", maxWidth: 600,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(130,0,219,.3)",
        animation: "scaleIn .2s ease",
      }}>

        {/* header */}
        <div style={{
          background: "linear-gradient(135deg, #8200db, #b44fff)",
          padding: "28px 32px", borderRadius: "20px 20px 0 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
              {mode === "create" ? "New Product" : "Edit Product"}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#fff", margin: 0 }}>
              {mode === "create" ? "Add to Catalogue" : "Update Details"}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* body */}
        <div style={{ padding: "28px 32px" }}>

          {/* image upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8200db", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Product Image
            </label>

            {previewSrc ? (
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1.5px solid #e0d0f7", height: 180 }}>
                <img src={previewSrc} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={removeImage} style={{
                  position: "absolute", top: 10, right: 10,
                  background: "rgba(255,58,94,.9)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,.2)",
                }}>✕</button>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,.5))",
                  padding: "12px 14px",
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,.9)" }}>
                    {form.imageFile?.name || "Current image"}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#8200db" : "#d0b8f0"}`,
                  borderRadius: 12, padding: "32px 20px",
                  textAlign: "center", cursor: "pointer",
                  background: dragOver ? "rgba(130,0,219,.04)" : "#faf7ff",
                  transition: "all .2s",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#8200db", fontWeight: 700, marginBottom: 4 }}>
                  Click to upload or drag & drop
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa" }}>
                  PNG, JPG, WEBP — max 5MB
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => handleFileChange(e.target.files[0])}
            />
          </div>

          {/* text fields grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }}>
            {textFields.map(({ key, label, type, required }) => (
              <div key={key}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8200db", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {label}{required && <span style={{ color: "#ff3a5e" }}> *</span>}
                </label>
                <input
                  type={type}
                  value={form[key] || ""}
                  onChange={e => onChange(key, e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          {/* size selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8200db", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Sizes <span style={{ color: "#ff3a5e" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SIZE_OPTIONS.map(s => {
                const selected = Array.isArray(form.size) && form.size.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    style={{
                      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                      fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
                      border: selected ? "2px solid #8200db" : "1.5px solid #e0d0f7",
                      background: selected ? "#8200db" : "#fff",
                      color: selected ? "#fff" : "#666",
                      transition: "all .15s",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8200db", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Description <span style={{ color: "#ff3a5e" }}>*</span>
            </label>
            <textarea
              value={form.description || ""}
              onChange={e => onChange("description", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{
              padding: "11px 24px", borderRadius: 8,
              border: "1.5px solid #ddd", background: "#fff", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 13,
            }}>
              Cancel
            </button>
            <button onClick={onSubmit} disabled={loading} style={{
              padding: "11px 28px", borderRadius: 8, border: "none",
              background: loading ? "#ccc" : "linear-gradient(135deg, #8200db, #b44fff)",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(130,0,219,.3)", transition: "transform .15s",
            }}>
              {loading ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}