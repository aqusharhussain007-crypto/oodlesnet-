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
  ];

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="filter-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="filter-header">
          <h3>Categories</h3>
          <button className="btn-small" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* CATEGORY PILLS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border:
                  active === c.slug
                    ? "2px solid #00c6ff"
                    : "1px solid #cceeff",
                background:
                  active === c.slug
                    ? "linear-gradient(90deg,#eafffb,#e9fff0)"
                    : "#fff",
                fontWeight: 700,
                color: "#0077aa",
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
    }
          
