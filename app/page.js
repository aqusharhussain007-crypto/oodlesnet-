// app/page.js
export default function Home() {
  return (
    <div>
      <h1 className="glow">OodlesNet 🚀</h1>

      {/* Search Bar */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search products..."
          className="search-bar"
        />
        <button className="glow">Search</button>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {[1, 2, 3].map((id) => (
          <div key={id} className="card">
            <img src="https://via.placeholder.com/250x150" alt={`Product ${id}`} />
            <h2 className="glow">Product {id}</h2>
            <p>$9{ id }.99</p>
            <button className="glow">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
            }
            
