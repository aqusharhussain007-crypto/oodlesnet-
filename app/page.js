// app/page.js
export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>OodlesNet 🚀</h1>

      {/* Sample Search Bar */}
      <div style={{ margin: "1.5rem 0" }}>
        <input
          type="text"
          placeholder="Search products..."
          style={{ width: "300px", padding: "0.5rem 1rem", border: "2px solid #ccc", borderRadius: "6px" }}
        />
        <button
          style={{
            marginLeft: "1rem",
            padding: "0.6rem 1.2rem",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#16d2ff",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(22,210,255,0.5)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(22,210,255,0.8)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 10px rgba(22,210,255,0.5)"}
        >
          Search
        </button>
      </div>

      {/* Product Grid */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="card"
            style={{
              width: "250px",
              padding: "1rem",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 20px rgba(22,210,255,0.3); transform: translateY(-5px)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05); transform: translateY(0)"}
          >
            <img
              src="https://via.placeholder.com/250x150"
              alt={`Sample Product ${item}`}
              style={{ width: "100%", borderRadius: "8px", marginBottom: "0.8rem" }}
            />
            <h2 style={{ color: "#16d2ff", textShadow: "0 0 5px rgba(22,210,255,0.7)" }}>Product {item}</h2>
            <p>$9{item}.99</p>
            <button
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#16d2ff",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(22,210,255,0.5)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(22,210,255,0.8)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 10px rgba(22,210,255,0.5)"}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
  }
