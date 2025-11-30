{/* Sticky Search Bar */}
<div
  style={{
    position: "sticky",
    top: "72px",
    background: "#e9ecf1",
    zIndex: 50,
    paddingBottom: "5px",
    paddingTop: "5px",
  }}
>
  <div
    style={{
      position: "relative",
      display: "flex",
      gap: "4px", // Reduced spacing
      alignItems: "center",
    }}
  >
    {/* Search Input */}
    <input
      type="text"
      className="search-bar"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ flex: 1 }}
    />

    {/* Search Button */}
    <button
      className="btn-glow"
      style={{
        fontSize: "18px",
        padding: "0 12px",
        borderRadius: "8px",
      }}
    >
      🔍
    </button>

    {/* Voice Search */}
    <button
      onClick={startVoiceSearch}
      className="btn-glow"
      style={{
        fontSize: "18px",
        padding: "0 12px",
        borderRadius: "8px",
      }}
    >
      🎤
    </button>

    {/* AUTOCOMPLETE */}
    {suggestions.length > 0 && (
      <div className="autocomplete-box">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="autocomplete-item"
            onClick={() => {
              setSearch(item.name);
              setSuggestions([]);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
        
