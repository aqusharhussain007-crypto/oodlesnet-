"use client";

export default function CompareDrawer({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 16,
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
          <h3 style={{ fontWeight: 900, fontSize: 18 }}>
            Compare
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: 10,
              padding: "4px 10px",
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {children}
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
          
