{/* Search Bar Section */}
<div
  style={{
    marginTop: "10px",
    padding: "12px 0",
    background: "#e9ecf1",
    position: "sticky",
    top: "70px",
    zIndex: 50,
  }}
>
  <div
    style={{
      display: "flex",
      gap: "8px",
      alignItems: "center",
      padding: "0 10px",
    }}
  >
    {/* Input Box */}
    <input
      type="text"
      className="search-bar"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        flex: 1,
        height: "48px",
        fontSize: "1.05rem",
        borderRadius: "12px",
        border: "2px solid #00b7ff",
        paddingLeft: "14px",
        background: "white",
      }}
    />

    {/* Search Button */}
    <button
      className="btn-glow"
      style={{
        width: "50px",
        height: "48px",
        fontSize: "1.4rem",
        borderRadius: "12px",
        padding: 0,
      }}
    >
      🔍
    </button>

    {/* Voice Search */}
    <button
      onClick={startVoiceSearch}
      className="btn-glow"
      style={{
        width: "50px",
        height: "48px",
        fontSize: "1.4rem",
        borderRadius: "12px",
        padding: 0,
      }}
    >
      🎤
    </button>
  </div>
</div>
