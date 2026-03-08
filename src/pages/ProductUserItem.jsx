import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5002/api/products";

export default function ProductUserItem() {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setFetching(false));
  }, []);

  const filtered = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4fb", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a002e", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Veloura</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{
            padding: "8px 18px", borderRadius: 20, border: "none",
            outline: "none", fontSize: 14, width: 260, background: "#2d0050", color: "#fff",
          }}
        />
      </div>

      <div style={{ padding: "36px 40px" }}>
        <h2 style={{ margin: "0 0 28px", color: "#1a002e", fontSize: 26, fontWeight: 700 }}>All Products</h2>

        {fetching ? (
          <div style={{ textAlign: "center", marginTop: 80, color: "#6c2ed7", fontSize: 18 }}>Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 80, color: "#aaa", fontSize: 16 }}>No products found.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
            {filtered.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                style={{
                  width: 240,
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 2px 12px rgba(108,46,215,0.10)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform .18s, box-shadow .18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(108,46,215,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(108,46,215,0.10)";
                }}
              >
                <img
                  src={product.imageUrl || "https://placehold.co/240x320?text=No+Image"}
                  alt={product.productName}
                  style={{ width: "100%", height: 320, objectFit: "cover" }}
                />
                <div style={{ padding: "14px 16px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1a002e", marginBottom: 4 }}>
                    {product.productName}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6, lineHeight: 1.4 }}>
                    {product.description?.length > 70
                      ? product.description.slice(0, 70) + "..."
                      : product.description}
                  </div>
                  <div style={{ fontWeight: 700, color: "#6c2ed7", fontSize: 15 }}>
                    Rs {product.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
