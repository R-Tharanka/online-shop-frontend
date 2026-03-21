import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_PRODUCT_API_BASE || "http://localhost:5002/api/products";

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
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <div style={{ color: "#6b7280", fontSize: 16, fontWeight: 500 }}>Loading product...</div>
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <div style={{ color: "#dc2626", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Product not found.</div>
        <button
          style={{ cursor: "pointer", background: "#fff", color: "#374151", padding: "10px 24px", borderRadius: 8, fontWeight: 500, fontSize: 14, border: "1px solid #e5e7eb", transition: "all .2s ease" }}
          onClick={() => navigate("/products")}
          onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", paddingBottom: 60 }}>

      {/* Hero Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button
          onClick={() => navigate("/products")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 16px",
            color: "#374151",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            transition: "all .2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          ← Back to Products
        </button>
        <div style={{ fontWeight: 700, fontSize: 24, color: "#111827", letterSpacing: 1 }}>
          Veloura
        </div>
      </div>

      {/* Content Card */}
      <div style={{ maxWidth: 1000, margin: "40px auto 0", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden", display: "flex", flexWrap: "wrap" }}>

        {/* Image Panel */}
        <div style={{ flex: "0 0 440px", maxWidth: 440, position: "relative", background: "#f9fafb", borderRight: "1px solid #e5e7eb" }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              style={{ width: "100%", height: 500, objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: 500, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No Image Available</div>
          )}
          {product.category && (
            <span style={{
              position: "absolute", top: 16, left: 16,
              background: "rgba(255,255,255,0.95)",
              color: "#374151", borderRadius: 6, padding: "4px 8px",
              fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
              border: "1px solid #e5e7eb", textTransform: "uppercase"
            }}>{product.category}</span>
          )}
          {product.stockQuantity > 0 ? (
            <span style={{
              position: "absolute", top: 16, right: 16,
              background: "#10b981",
              color: "#fff", borderRadius: 6, padding: "4px 8px",
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
            }}>In Stock</span>
          ) : (
            <span style={{
              position: "absolute", top: 16, right: 16,
              background: "#ef4444",
              color: "#fff", borderRadius: 6, padding: "4px 8px",
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
            }}>Sold Out</span>
          )}
        </div>

        {/* Details Panel */}
        <div style={{ flex: 1, padding: "40px 48px", display: "flex", flexDirection: "column" }}>

          {/* Brand */}
          {product.brand && (
            <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>
              {product.brand}
            </div>
          )}

          {/* Name */}
          <h1 style={{ margin: "0 0 16px", color: "#111827", fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>
            {product.productName}
          </h1>

          {/* Price */}
          <div style={{
            fontSize: 24, fontWeight: 700, marginBottom: 24,
            color: "#1f1b2e", display: "inline-block",
          }}>
            Rs {product.price}
          </div>

          {/* Description */}
          <p style={{ color: "#4b5563", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
            {product.description}
          </p>

          {/* Stock indicator */}
          <div style={{
            marginBottom: 24, fontSize: 13, fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 6,
            background: product.stockQuantity > 0 ? "#d1fae5" : "#fee2e2",
            color: product.stockQuantity > 0 ? "#065f46" : "#b91c1c",
            borderRadius: 6, padding: "6px 12px", width: "fit-content",
          }}>
            {product.stockQuantity > 0 ? `In Stock — ${product.stockQuantity} items available` : "Out of Stock"}
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 12, fontSize: 14 }}>Select Size:</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Array.isArray(product.size) && product.size.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: "8px 24px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: selectedSize === s ? "#1f1b2e" : "#e5e7eb",
                    background: selectedSize === s ? "#1f1b2e" : "#fff",
                    color: selectedSize === s ? "#fff" : "#374151",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all .2s ease",
                  }}
                  onMouseEnter={e => { if(selectedSize !== s) e.currentTarget.style.background = "#f9fafb" }}
                  onMouseLeave={e => { if(selectedSize !== s) e.currentTarget.style.background = "#fff" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 12, fontSize: 14 }}>Quantity:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={{
                  width: 44, height: 44, fontSize: 20, fontWeight: 400,
                  background: quantity <= 1 ? "#f9fafb" : "#fff",
                  color: quantity <= 1 ? "#9ca3af" : "#374151",
                  border: "none", cursor: quantity <= 1 ? "not-allowed" : "pointer",
                  transition: "background .15s", borderRight: "1px solid #e5e7eb"
                }}
              >−</button>
              <span style={{ minWidth: 52, textAlign: "center", fontSize: 16, fontWeight: 500, color: "#111827", userSelect: "none", background: "#fff" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={quantity >= product.stockQuantity}
                style={{
                  width: 44, height: 44, fontSize: 20, fontWeight: 400,
                  background: quantity >= product.stockQuantity ? "#f9fafb" : "#fff",
                  color: quantity >= product.stockQuantity ? "#9ca3af" : "#374151",
                  border: "none", cursor: quantity >= product.stockQuantity ? "not-allowed" : "pointer",
                  transition: "background .15s", borderLeft: "1px solid #e5e7eb"
                }}
              >+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 8,
                border: "1px solid",
                borderColor: addedToCart ? "#10b981" : "#1f1b2e",
                background: addedToCart ? "#10b981" : "#fff",
                color: addedToCart ? "#fff" : "#1f1b2e",
                fontWeight: 600,
                fontSize: 15,
                cursor: product.stockQuantity === 0 ? "not-allowed" : "pointer",
                transition: "all .2s ease",
              }}
              onMouseEnter={e => { if(!addedToCart && product.stockQuantity > 0) e.currentTarget.style.background = "#f9fafb" }}
              onMouseLeave={e => { if(!addedToCart && product.stockQuantity > 0) e.currentTarget.style.background = "#fff" }}
            >
              {addedToCart ? "Added to Cart" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 8,
                border: "none",
                background: product.stockQuantity === 0 ? "#e5e7eb" : "#1f1b2e",
                color: product.stockQuantity === 0 ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: 15,
                cursor: product.stockQuantity === 0 ? "not-allowed" : "pointer",
                transition: "all .2s ease",
              }}
              onMouseEnter={e => { if(product.stockQuantity > 0) e.currentTarget.style.background = "#2c2740" }}
              onMouseLeave={e => { if(product.stockQuantity > 0) e.currentTarget.style.background = "#1f1b2e" }}
            >
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap", borderTop: "1px solid #e5e7eb", paddingTop: 24 }}>
            {["Free Delivery", "Easy Returns", "Secure Payment"].map((badge) => (
              <span key={badge} style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d1d5db" }} />
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
          background: toast.type === "success" ? "#10b981" : "#ef4444",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "slideUp 0.3s ease",
          maxWidth: "90vw",
          textAlign: "center",
        }}>
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