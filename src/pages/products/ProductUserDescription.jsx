import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_PRODUCT_API_BASE || "http://localhost:5002/api/products";

export default function ProductUserDescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [fetching, setFetching] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }

  useEffect(() => {
    fetch(`${API_BASE}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (Array.isArray(data.size) && data.size.length > 0) {
          setSelectedSize(data.size[0]);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setFetching(false));
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const deductStockInDB = async (qty) => {
    try {
      const res = await fetch(`${API_BASE}/${product._id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProduct((prev) => ({ ...prev, stockQuantity: data.stockQuantity }));
      return true;
    } catch (err) {
      showToast(err.message || "Failed to update stock", "error");
      return false;
    }
  };

  const buildCartItem = () => ({
    productId: product._id,
    productName: product.productName,
    brand: product.brand,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
    selectedSize,
    quantity,
  });

  const handleAddToCart = async () => {
    if (!selectedSize) return showToast("Please select a size.", "error");

    const deducted = await deductStockInDB(quantity);
    if (!deducted) return;

    const existing = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const idx = existing.findIndex(
      (item) => item.productId === product._id && item.selectedSize === selectedSize
    );
    if (idx !== -1) {
      existing[idx].quantity += quantity;
    } else {
      existing.push(buildCartItem());
    }
    sessionStorage.setItem("cart", JSON.stringify(existing));

    setAddedToCart(true);
    showToast(`🛒 ${product.productName} (${selectedSize} × ${quantity}) added to cart!`, "success");
    setTimeout(() => navigate("/cart"), 1500);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) return showToast("Please select a size.", "error");

    const deducted = await deductStockInDB(quantity);
    if (!deducted) return;

    sessionStorage.setItem("buyNow", JSON.stringify(buildCartItem()));
    navigate("/checkout");

    //showToast(`⚡ Order placed for ${product.productName} (${selectedSize} × ${quantity})!`, "success");
  };

  if (fetching) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#faf5ff 0%,#f0f9ff 50%,#fdf2f8 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans', sans-serif" }}>
        <div style={{ fontSize: 46, marginBottom: 16 }}>✨</div>
        <div style={{ color: "#a855f7", fontSize: 18, fontWeight: 700 }}>Loading product...</div>
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#faf5ff 0%,#f0f9ff 50%,#fdf2f8 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans', sans-serif" }}>
        <div style={{ fontSize: 46, marginBottom: 16 }}>🔍</div>
        <div style={{ color: "#e00", fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Product not found.</div>
        <span
          style={{ cursor: "pointer", background:"linear-gradient(90deg,#7c3aed,#ec4899)", color:"#fff", padding:"10px 28px", borderRadius:50, fontWeight:700, fontSize:14, boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#faf5ff 0%,#f0f9ff 50%,#fdf2f8 100%)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Hero Header */}
      <div style={{
        background: "linear-gradient(120deg, #7c3aed 0%, #a855f7 40%, #ec4899 75%, #f97316 100%)",
        padding: "22px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-40, right:60, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }} />
        <button
          onClick={() => navigate("/products")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            borderRadius: 50,
            padding: "8px 20px",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            letterSpacing: 0.3,
          }}
        >
          ← Back to Products
        </button>
        <div style={{ fontWeight: 900, fontSize: 26, color: "#fff", letterSpacing: 3, textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          ✦ Veloura ✦
        </div>
      </div>

      {/* Content Card */}
      <div style={{ maxWidth: 960, margin: "40px auto 60px", background: "#fff", borderRadius: 24, boxShadow: "0 8px 48px rgba(124,58,237,0.13)", overflow: "hidden", display: "flex", flexWrap: "wrap" }}>

        {/* Image Panel */}
        <div style={{ flex: "0 0 400px", maxWidth: 400, position: "relative" }}>
          <img
            src={product.imageUrl || "https://placehold.co/400x460?text=No+Image"}
            alt={product.productName}
            style={{ width: "100%", height: 460, objectFit: "cover", display: "block" }}
          />
          {/* gradient overlay */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:100, background:"linear-gradient(to top, rgba(124,58,237,0.35), transparent)" }} />
          {product.category && (
            <span style={{
              position:"absolute", top:16, left:16,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color:"#fff", borderRadius:50, padding:"5px 14px",
              fontSize:12, fontWeight:700, letterSpacing:0.5,
              boxShadow:"0 3px 12px rgba(124,58,237,0.35)",
            }}>{product.category}</span>
          )}
          {product.stockQuantity > 0 ? (
            <span style={{
              position:"absolute", top:16, right:16,
              background: "linear-gradient(135deg,#10b981,#06b6d4)",
              color:"#fff", borderRadius:50, padding:"5px 14px",
              fontSize:11, fontWeight:700, letterSpacing:0.5,
              boxShadow:"0 3px 12px rgba(16,185,129,0.35)",
            }}>IN STOCK</span>
          ) : (
            <span style={{
              position:"absolute", top:16, right:16,
              background: "linear-gradient(135deg,#ef4444,#f97316)",
              color:"#fff", borderRadius:50, padding:"5px 14px",
              fontSize:11, fontWeight:700, letterSpacing:0.5,
            }}>SOLD OUT</span>
          )}
        </div>

        {/* Details Panel */}
        <div style={{ flex: 1, padding: "40px 44px", display: "flex", flexDirection: "column" }}>

          {/* Brand + Category pills */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap:"wrap" }}>
            {product.brand && (
              <span style={{ background:"linear-gradient(135deg,#ec4899,#f97316)", color:"#fff", borderRadius:50, padding:"4px 16px", fontSize:12, fontWeight:700, boxShadow:"0 2px 8px rgba(236,72,153,0.3)" }}>
                {product.brand}
              </span>
            )}
            {product.category && (
              <span style={{ background:"#f3e8ff", color:"#7c3aed", borderRadius:50, padding:"4px 16px", fontSize:12, fontWeight:700, border:"1.5px solid #ddd6fe" }}>
                {product.category}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 style={{ margin: "0 0 10px", color: "#1a002e", fontSize: 28, fontWeight: 900, lineHeight: 1.25 }}>
            {product.productName}
          </h1>

          {/* Price */}
          <div style={{
            fontSize: 28, fontWeight: 900, marginBottom: 18,
            background: "linear-gradient(90deg,#7c3aed,#ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            display: "inline-block",
          }}>
            Rs {product.price}
          </div>

          {/* Description */}
          <p style={{ color: "#666", fontSize: 14.5, lineHeight: 1.75, marginBottom: 20, background:"#faf5ff", borderRadius:12, padding:"14px 16px", borderLeft:"4px solid #a855f7" }}>
            {product.description}
          </p>

          {/* Stock indicator */}
          <div style={{
            marginBottom: 20, fontSize: 13, fontWeight: 700,
            display:"inline-flex", alignItems:"center", gap:8,
            background: product.stockQuantity > 0 ? "#d1fae5" : "#fee2e2",
            color: product.stockQuantity > 0 ? "#065f46" : "#b91c1c",
            borderRadius:50, padding:"6px 16px", width:"fit-content",
          }}>
            <span style={{ fontSize:16 }}>{product.stockQuantity > 0 ? "✔" : "✘"}</span>
            {product.stockQuantity > 0 ? `In Stock — ${product.stockQuantity} available` : "Out of Stock"}
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 800, color: "#1a002e", marginBottom: 12, fontSize:14 }}>Select Size:</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Array.isArray(product.size) && product.size.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: "9px 24px",
                    borderRadius: 50,
                    border: selectedSize === s ? "none" : "1.5px solid #ddd6fe",
                    background: selectedSize === s
                      ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                      : "#f5f3ff",
                    color: selectedSize === s ? "#fff" : "#7c3aed",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all .15s",
                    boxShadow: selectedSize === s ? "0 4px 14px rgba(124,58,237,0.35)" : "none",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 800, color: "#1a002e", marginBottom: 12, fontSize:14 }}>Quantity:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", borderRadius: 50, overflow: "hidden", boxShadow:"0 4px 16px rgba(124,58,237,0.15)", border:"2px solid #ede9fe" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={{
                  width: 44, height: 44, fontSize: 22, fontWeight: 700,
                  background: quantity <= 1 ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: quantity <= 1 ? "#c4b5fd" : "#fff",
                  border: "none", cursor: quantity <= 1 ? "not-allowed" : "pointer",
                  transition: "background .15s",
                }}
              >−</button>
              <span style={{ minWidth: 52, textAlign: "center", fontSize: 17, fontWeight: 800, color: "#1a002e", userSelect: "none", background:"#fff" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={quantity >= product.stockQuantity}
                style={{
                  width: 44, height: 44, fontSize: 22, fontWeight: 700,
                  background: quantity >= product.stockQuantity ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: quantity >= product.stockQuantity ? "#c4b5fd" : "#fff",
                  border: "none", cursor: quantity >= product.stockQuantity ? "not-allowed" : "pointer",
                  transition: "background .15s",
                }}
              >+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 14 }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 50,
                border: addedToCart ? "none" : "2.5px solid #7c3aed",
                background: addedToCart
                  ? "linear-gradient(135deg,#10b981,#06b6d4)"
                  : "#fff",
                color: addedToCart ? "#fff" : "#7c3aed",
                fontWeight: 800,
                fontSize: 15,
                cursor: product.stockQuantity === 0 ? "not-allowed" : "pointer",
                transition: "all .2s",
                boxShadow: addedToCart ? "0 6px 20px rgba(16,185,129,0.35)" : "none",
                letterSpacing: 0.3,
              }}
            >
              {addedToCart ? "✔ Added to Cart!" : "🛒 Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 50,
                border: "none",
                background: product.stockQuantity === 0
                  ? "#e5e7eb"
                  : "linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)",
                color: product.stockQuantity === 0 ? "#9ca3af" : "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: product.stockQuantity === 0 ? "not-allowed" : "pointer",
                boxShadow: product.stockQuantity === 0 ? "none" : "0 6px 20px rgba(124,58,237,0.38)",
                letterSpacing: 0.3,
              }}
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display:"flex", gap:16, marginTop:24, flexWrap:"wrap" }}>
            {["🚚 Free Delivery","↩ Easy Returns","🔒 Secure Payment"].map((badge) => (
              <span key={badge} style={{ fontSize:12, fontWeight:600, color:"#7c3aed", background:"#f5f3ff", borderRadius:50, padding:"5px 14px", border:"1px solid #ede9fe" }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: toast.type === "success"
            ? "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)"
            : "linear-gradient(135deg,#ef4444,#f97316)",
          color: "#fff",
          padding: "16px 32px",
          borderRadius: 50,
          fontSize: 15,
          fontWeight: 700,
          boxShadow: toast.type === "success"
            ? "0 8px 32px rgba(124,58,237,0.45)"
            : "0 8px 32px rgba(239,68,68,0.45)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          letterSpacing: 0.2,
          animation: "slideUp 0.3s ease",
          maxWidth: "90vw",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 20 }}>{toast.type === "success" ? "✔" : "✕"}</span>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}