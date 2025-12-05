"use client";

import { addDefaultPrices } from "@/scripts/addPricesToProducts";

export default function RunUpdate() {
  const run = async () => {
    alert("Updating all products... check console.");
    await addDefaultPrices();
    alert("✅ Completed!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Run Product Price Update</h2>
      <button
        onClick={run}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          background: "#007bff",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Run Script
      </button>
    </div>
  );
}
