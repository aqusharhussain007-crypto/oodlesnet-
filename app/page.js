// app/page.js
export default function Home() {
  return (
    <>
      <h1>OodlesNet 🚀</h1>

      {/* Search Bar */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search products..."
          className="search-bar"
        />
        <button style={{ marginLeft: "1rem" }}>Search</button>
      </div>

      {/* Cards Grid */}
      <div className="product-grid">
        {[1, 2, 3].map((item) => (
          <div key={item} className="card">
            <img src="https://via.placeholder.com/250x150" alt="Product" />
            <h2>Product {item}</h2>
            <p>$9{item}.99</p>
            <button>Buy Now</button>
          </div>
        ))}
      </div>
    </>
  );
            }
            
