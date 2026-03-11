import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_PRODUCT_API_BASE || "http://localhost:5002/api/products";

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

  const cardAccents = [
    { border: "#a78bfa", badge: "linear-gradient(135deg,#7c3aed,#a855f7)", tag: "#f3e8ff", tagText: "#7c3aed" },
    { border: "#f472b6", badge: "linear-gradient(135deg,#ec4899,#f97316)", tag: "#fce7f3", tagText: "#be185d" },
    { border: "#34d399", badge: "linear-gradient(135deg,#10b981,#06b6d4)", tag: "#d1fae5", tagText: "#065f46" },
    { border: "#fb923c", badge: "linear-gradient(135deg,#f97316,#eab308)", tag: "#ffedd5", tagText: "#c2410c" },
    { border: "#60a5fa", badge: "linear-gradient(135deg,#3b82f6,#8b5cf6)", tag: "#dbeafe", tagText: "#1d4ed8" },
    { border: "#f87171", badge: "linear-gradient(135deg,#ef4444,#ec4899)", tag: "#fee2e2", tagText: "#b91c1c" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#faf5ff 0%,#f0f9ff 50%,#fdf2f8 100%)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(120deg, #7c3aed 0%, #a855f7 40%, #ec4899 75%, #f97316 100%)",
        padding: "56px 40px 52px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position:"absolute", top:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, right:-40, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:20, right:80, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />

        {/* Brand */}
        <div style={{
          fontWeight: 900,
          fontSize: 46,
          letterSpacing: 4,
          color: "#fff",
          textShadow: "0 4px 24px rgba(0,0,0,0.18)",
          marginBottom: 8,
        }}>
          ✦ Veloura ✦
        </div>
        <p style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 15,
          margin: "0 0 32px",
          letterSpacing: 1,
          fontWeight: 500,
        }}>
          Discover · Style · Own
        </p>

        {/* Search Bar */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.95)",
          borderRadius: 50,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          border: "2px solid rgba(255,255,255,0.6)",
          padding: "6px 10px 6px 22px",
          width: "100%",
          maxWidth: 500,
          backdropFilter: "blur(8px)",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand or category..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "#3a1060",
              background: "transparent",
              padding: "8px 14px",
              fontWeight: 500,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "linear-gradient(135deg,#a855f7,#ec4899)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                cursor: "pointer",
                color: "#fff",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(168,85,247,0.4)",
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{
        display: "flex",
        gap: 10,
        padding: "20px 40px 4px",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {["All", "Women", "Men", "Kids", "Accessories", "Sale 🔥"].map((tag, i) => {
          const colors = ["#7c3aed","#ec4899","#3b82f6","#10b981","#f97316","#ef4444"];
          return (
            <span key={tag} style={{
              background: `${colors[i]}18`,
              color: colors[i],
              border: `1.5px solid ${colors[i]}40`,
              borderRadius: 50,
              padding: "6px 18px",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all .15s",
            }}>{tag}</span>
          );
        })}
      </div>

      <div style={{ padding: "28px 40px 48px" }}>
        {/* Section heading */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: 28 }}>
          <div style={{ width:5, height:30, borderRadius:4, background:"linear-gradient(180deg,#7c3aed,#ec4899)" }} />
          <h2 style={{ margin: 0, color: "#1a002e", fontSize: 24, fontWeight: 800, letterSpacing:0.3 }}>All Products</h2>
          <span style={{
            background:"linear-gradient(90deg,#a855f7,#ec4899)",
            color:"#fff",
            borderRadius:50,
            padding:"2px 12px",
            fontSize:12,
            fontWeight:700,
            marginLeft:4,
          }}>{filtered.length}</span>
        </div>

        {fetching ? (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
            <div style={{ color: "#a855f7", fontSize: 17, fontWeight: 600 }}>Loading amazing products...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ color: "#9b6ec8", fontSize: 16, fontWeight: 500 }}>No products found. Try a different search!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
            {filtered.map((product, idx) => {
              const accent = cardAccents[idx % cardAccents.length];
              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{
                    width: 240,
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: `0 2px 16px rgba(0,0,0,0.07)`,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform .2s, box-shadow .2s",
                    border: `2px solid transparent`,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.13)`;
                    e.currentTarget.style.border = `2px solid ${accent.border}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
                    e.currentTarget.style.border = "2px solid transparent";
                  }}
                >
                  {/* Image with gradient overlay */}
                  <div style={{ position: "relative" }}>
                    <img
                      src={product.imageUrl || "https://placehold.co/240x320?text=No+Image"}
                      alt={product.productName}
                      style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position:"absolute", bottom:0, left:0, right:0, height:60,
                      background:"linear-gradient(to top, rgba(0,0,0,0.32), transparent)",
                    }} />
                    {/* Category badge */}
                    {product.category && (
                      <span style={{
                        position:"absolute", top:10, left:10,
                        background: accent.badge,
                        color:"#fff",
                        borderRadius:50,
                        padding:"3px 10px",
                        fontSize:11,
                        fontWeight:700,
                        letterSpacing:0.5,
                        boxShadow:"0 2px 8px rgba(0,0,0,0.18)",
                      }}>{product.category}</span>
                    )}
                    {/* New badge */}
                    <span style={{
                      position:"absolute", top:10, right:10,
                      background:"rgba(255,255,255,0.9)",
                      color:"#7c3aed",
                      borderRadius:50,
                      padding:"3px 9px",
                      fontSize:10,
                      fontWeight:800,
                      letterSpacing:0.5,
                    }}>NEW</span>
                  </div>

                  <div style={{ padding: "14px 16px 18px" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1a002e", marginBottom: 4, lineHeight: 1.3 }}>
                      {product.productName}
                    </div>
                    {product.brand && (
                      <span style={{
                        display:"inline-block",
                        background: accent.tag,
                        color: accent.tagText,
                        borderRadius: 50,
                        padding:"2px 9px",
                        fontSize:11,
                        fontWeight:700,
                        marginBottom:6,
                      }}>{product.brand}</span>
                    )}
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 10, lineHeight: 1.5 }}>
                      {product.description?.length > 65
                        ? product.description.slice(0, 65) + "..."
                        : product.description}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: 17,
                        background: accent.badge,
                        WebkitBackgroundClip:"text",
                        WebkitTextFillColor:"transparent",
                      }}>
                        Rs {product.price}
                      </div>
                      <div style={{
                        background: accent.badge,
                        borderRadius: 50,
                        width: 30,
                        height: 30,
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        color:"#fff",
                        fontSize:15,
                        boxShadow:`0 3px 10px rgba(0,0,0,0.15)`,
                      }}>›</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
