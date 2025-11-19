<h1>Welcome to OodlesNet </h1>import ProductCard from "./ProductCard";

export default function Home() {
  const sampleProducts = [
    {
      store: "Amazon",
      name: "Wireless Earbuds",
      price: 1299,
      link: "https://www.amazon.in/",
    },
    {
      store: "Flipkart",
      name: "Smartwatch",
      price: 2199,
      link: "https://www.flipkart.com/",
    },
    {
      store: "Meesho",
      name: "Backpack",
      price: 899,
      link: "https://www.meesho.com/",
    },
  ];

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Welcome to OodlesNet</h1>
      <p>Your one-stop search for Amazon, Flipkart, Meesho & more.</p>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search any product..."
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <h2 style={{ marginTop: "30px" }}>Sample Products</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "15px",
        }}
      >
        {sampleProducts.map((product, index) => (
          <ProductCard
            key={index}
            store={product.store}
            name={product.name}
            price={product.price}
            link={product.link}
          />
        ))}
      </div>
    </div>
  );
            }
  
