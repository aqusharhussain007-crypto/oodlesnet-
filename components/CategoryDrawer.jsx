"use client";

export default function CategoryDrawer({
  isOpen,
  onClose,
  categories,
  selectedCat,
  onSelect,
}) {
  if (!isOpen) return null;

  return (
    <div className="filter-drawer-backdrop" onClick={onClose}>
      <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
        <h3 className="section-title">Categories</h3>

        {/* SAFE IMAGE CONTAINER */}
        <div className="category-image">
          <img
            src="/categories/electronics.jpg"
            alt="Electronics"
          />
        </div>

        <div className="cat-pills-row">
          <button className="cat-pill" onClick={() => onSelect("mobile")}>
            Mobiles
          </button>
        <button className="cat-pill" onClick={() => onSelect("laptop")}>
            Laptops
          </button>
          <button className="cat-pill" onClick={() => onSelect("electronic")}>
            Electronics
          </button>
        </div>
      </div>
    </div>
  );
        }
          
