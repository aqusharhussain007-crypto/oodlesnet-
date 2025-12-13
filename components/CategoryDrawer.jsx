"use client";

export default function CategoryDrawer({
  isOpen,
  onClose,
  categories = [],
  selectedCat,
  onSelect,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="category-drawer-backdrop"
      onClick={(e) => {
        if (e.target.classList.contains("category-drawer-backdrop")) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 999,
      }}
    >
      <div
        className="category-drawer"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTopLeftRadius: "22px",
          borderTopRightRadius: "22px",
          padding: "20px",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ color: "#0077b6", fontWeight: 700 }}>Categories</h3>
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px",
              background: "#eee",
              borderRadius: "10px",
            }}
          >
            ✕
          </button>
        </div>

        {/* CATEGORY PILLS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "14px",
          }}
        >
          {/* ALL */}
          <div
            onClick={() => {
              onSelect("all");
              onClose();
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              border: selectedCat === "all" ? "2px solid #00c6ff" : "1px solid #ccc",
              background: selectedCat === "all" ? "#e6faff" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            All
          </div>

          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onSelect(c.slug);
                onClose();
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                border:
                  selectedCat === c.slug ? "2px solid #00c6ff" : "1px solid #ccc",
                background: selectedCat === c.slug ? "#e6faff" : "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </div>
          ))}
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
              
