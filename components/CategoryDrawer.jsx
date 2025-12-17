"use client";

export default function CategoryDrawer({
  active = "all",
  onSelect,
  onClose,
}) {
  const categories = [
    { slug: "all", name: "All" },
    { slug: "mobile", name: "Mobile" },
    { slug: "laptop", name: "Laptop" },
    { slug: "electronics", name: "Electronics" },

    // ✅ NEW (necessary categories)
    { slug: "fashion", name: "Fashion" },
    { slug: "appliances", name: "Appliances" },
    { slug: "beauty", name: "Beauty" },
    { slug: "home", name: "Home & Kitchen" },
    { slug: "grocery", name: "Grocery" },
    { slug: "accessories", name: "Accessories" },
  ];

  const GRADIENT = "linear-gradient(135deg,#023e8a,#0096c7,#00b4a8)";

  return (
    <div
      className="category-drawer-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#fff",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: 18,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Categories
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#eee",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {categories.map((c) => {
            const activeState = active === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => onSelect(c.slug)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid transparent",
                  background: activeState
                    ? GRADIENT
                    : "linear-gradient(#fff,#fff) padding-box, " +
                      GRADIENT +
                      " border-box",
                  fontWeight: 700,
                  color: activeState ? "#fff" : "#023e8a",
                  cursor: "pointer",
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
                  }
