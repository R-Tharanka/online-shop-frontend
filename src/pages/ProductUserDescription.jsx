import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5002/api/products";

export default function ProductUserDescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [fetching, setFetching] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Please select a size.");

    const existing = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const idx = existing.findIndex(
      (item) => item.productId === product._id && item.selectedSize === selectedSize
    );
    if (idx !== -1) {
      existing[idx].quantity = Math.min(
        product.stockQuantity,
        existing[idx].quantity + quantity
      );
    } else {
      existing.push(buildCartItem());
    }
    sessionStorage.setItem("cart", JSON.stringify(existing));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return alert("Please select a size.");

    sessionStorage.setItem("buyNow", JSON.stringify(buildCartItem()));
    // TODO: navigate to checkout page
    alert(`Saved for checkout: ${product.productName} (Size: ${selectedSize}, Qty: ${quantity})`);
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", marginTop: 100, color: "#6c2ed7", fontSize: 18, fontFamily: "'DM Sans', sans-serif" }}>
        Loading product...
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div style={{ textAlign: "center", marginTop: 100, color: "#e00", fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Product not found.{" "}
        <span style={{ cursor: "pointer", color: "#6c2ed7", textDecoration: "underline" }} onClick={() => navigate("/products")}>
          Go back
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4fb", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a002e", padding: "18px 40px", display: "flex", alignItems: "center", gap: 16 }}>
        <span
          onClick={() => navigate("/products")}
          style={{ color: "#c9a8f5", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to Products
        </span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1, marginLeft: "auto" }}>Veloura</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "48px auto", background: "#fff", borderRadius: 18, boxShadow: "0 4px 28px rgba(108,46,215,0.12)", overflow: "hidden", display: "flex", flexWrap: "wrap" }}>
        {/* Image */}
        <div style={{ flex: "0 0 380px", maxWidth: 380 }}>
          <img
            src={product.imageUrl || "https://placehold.co/380x380?text=No+Image"}
            alt={product.productName}
            style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Details */}
        <div style={{ flex: 1, padding: "36px 40px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          {/* Category & Brand */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <span style={{ background: "#e0d0f7", color: "#6c2ed7", borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 600 }}>
              {product.category}
            </span>
            <span style={{ background: "#f0e8ff", color: "#a060e0", borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 600 }}>
              {product.brand}
            </span>
          </div>

          {/* Name */}
          <h1 style={{ margin: "0 0 10px", color: "#1a002e", fontSize: 26, fontWeight: 800 }}>
            {product.productName}
          </h1>

          {/* Price */}
          <div style={{ fontSize: 24, fontWeight: 700, color: "#6c2ed7", marginBottom: 16 }}>
            Rs {product.price}
          </div>

          {/* Description */}
          <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            {product.description}
          </p>

          {/* Stock */}
          <div style={{ marginBottom: 18, fontSize: 13, color: product.stockQuantity > 0 ? "#2a9d5c" : "#e00" }}>
            {product.stockQuantity > 0 ? `✔ In Stock (${product.stockQuantity} available)` : "✘ Out of Stock"}
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 700, color: "#1a002e", marginBottom: 10 }}>Select Size:</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Array.isArray(product.size) && product.size.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    border: selectedSize === s ? "2px solid #6c2ed7" : "1.5px solid #d0b8f0",
                    background: selectedSize === s ? "#6c2ed7" : "#f7f4fb",
                    color: selectedSize === s ? "#fff" : "#1a002e",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: "#1a002e", marginBottom: 10 }}>Quantity:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", border: "1.5px solid #d0b8f0", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={{
                  width: 40, height: 40, fontSize: 20, fontWeight: 700,
                  background: quantity <= 1 ? "#f0e8ff" : "#6c2ed7",
                  color: quantity <= 1 ? "#c0a0e0" : "#fff",
                  border: "none", cursor: quantity <= 1 ? "not-allowed" : "pointer",
                  transition: "background .15s",
                }}
              >
                −
              </button>
              <span style={{ minWidth: 44, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#1a002e", userSelect: "none" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={quantity >= product.stockQuantity}
                style={{
                  width: 40, height: 40, fontSize: 20, fontWeight: 700,
                  background: quantity >= product.stockQuantity ? "#f0e8ff" : "#6c2ed7",
                  color: quantity >= product.stockQuantity ? "#c0a0e0" : "#fff",
                  border: "none", cursor: quantity >= product.stockQuantity ? "not-allowed" : "pointer",
                  transition: "background .15s",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 10,
                border: "2px solid #6c2ed7",
                background: addedToCart ? "#4caf76" : "#fff",
                color: addedToCart ? "#fff" : "#6c2ed7",
                fontWeight: 700,
                fontSize: 15,
                cursor: product.stockQuantity === 0 ? "not-allowed" : "pointer",
                transition: "background .2s, color .2s",
              }}
            >
              {addedToCart ? "Added ✔" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background: product.stockQuantity === 0 ? "#ccc" : "#6c2ed7",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: product.stockQuantity === 0 ? "not-allowed" : "pointer",
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
