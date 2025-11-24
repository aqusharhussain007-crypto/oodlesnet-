export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4 shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />

      <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
      <p className="text-gray-600">{product.description}</p>
      <p classname="font-bold mt-2">₹{product.price}</p>
    </div>
  );
}
