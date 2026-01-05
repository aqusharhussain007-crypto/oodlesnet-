"use client";

export default function CategoryDrawer({
  active = "all",
  onSelect,
  onClose,
}) {
  const categories = [
    { slug: "all", name: "All", icon: "grid" },
    { slug: "mobile", name: "Mobile", icon: "mobile" },
    { slug: "laptop", name: "Laptop", icon: "laptop" },
    { slug: "electronics", name: "Electronics", icon: "cpu" },
    { slug: "fashion", name: "Fashion", icon: "tshirt" },
    { slug: "appliances", name: "Appliances", icon: "fridge" },
    { slug: "beauty", name: "Beauty", icon: "sparkle" },
    { slug: "home", name: "Home & Kitchen", icon: "home" },
    { slug: "grocery", name: "Grocery", icon: "cart" },
    { slug: "accessories", name: "Accessories", icon: "watch" },
  ];

  const GRADIENT = "linear-gradient(135deg,#023e8a,#0096c7,#00b4a8)";

  const Icon = ({ type }) => {
    const props = { width: 18, height: 18, stroke: "currentColor", fill: "none", strokeWidth: 2 };
    switch (type) {
      case "mobile":
        return <svg {...props} viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" /></svg>;
      case "laptop":
        return <svg {...props} viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="10" rx="2" /><path d="M2 19h20" /></svg>;
      case "cpu":
        return <svg {...props} viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
      case "tshirt":
        return <svg {...props} viewBox="0 0 24 24"><path d="M4 4l4-2 4 2 4-2 4 2v4l-2 2v10H6V8L4 6z" /></svg>;
      case "fridge":
        return <svg {...props} viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>;
      case "sparkle":
        return <svg {...props} viewBox="0 0 24 24"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></svg>;
      case "home":
        return <svg {...props} viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
      case "cart":
        return <svg {...props} viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l3 12h11l3-8H6" /></svg>;
      case "watch":
        return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M8 2h8M8 22h8" /></svg>;
      default:
        return <svg {...props} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    }
  };

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

        {/* Vertical list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          {categories.map((c) => {
            const activeState = active === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => onSelect(c.slug)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
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
                <Icon type={c.icon} />
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
