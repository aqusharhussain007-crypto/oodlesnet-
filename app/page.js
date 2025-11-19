export default function Home() {
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

      <p style={{ marginTop: "20px" }}>
        Product listings will appear here soon…
      </p>
    </div>
  );
                  }
          
