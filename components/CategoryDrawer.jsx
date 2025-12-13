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
          boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
          animation: "slideUp 0.28s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontWeight: 700, color: "#0077b6" }}>Categories</h3>
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px",
              background: "#eee",
              borderRadius: 10,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {/* ALL */}
          <div
            onClick={() => {
              onSelect("all");
              onClose();
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "14px",
              border: selectedCat === "all" ? "2px solid #00c6ff" : "1px solid #ddd",
              background: selectedCat === "all" ? "#e6faff" : "#fff",
              fontWeight: 600,
              cursor: "pointer",
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
                padding: "10px 16px",
                borderRadius: "14px",
                border:
                  selectedCat === c.slug ? "2px solid #00c6ff" : "1px solid #ddd",
                background: selectedCat === c.slug ? "#e6faff" : "#fff",
                fontWeight: 600,
                cursor: "pointer",
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
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
          }
          
