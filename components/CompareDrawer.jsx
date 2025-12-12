'use client';
import React from 'react';

/**
 * CompareDrawer
 * Props:
 *  - open: boolean
 *  - product: product object (with store[] array)
 *  - onClose: () => void
 */
export default function CompareDrawer({ open, product, onClose }) {
  if (!open || !product) return null;

  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-end">
      {/* semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-3xl mx-auto p-4 bg-white rounded-t-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-[#0077b6] truncate">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-gray-100 text-sm"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="mb-2 text-sm text-gray-700">Compare prices</div>

        {/* horizontal list of store cards */}
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1">
          {product.store && product.store.length ? (
            product.store.map((s, idx) => (
              <div
                key={idx}
                className="min-w-[220px] bg-gradient-to-br from-white to-white/90 rounded-xl p-3 shadow-md border"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold">{s.name}</div>
                    <div className="text-lg font-bold mt-1">₹{Number(s.price).toLocaleString('en-IN')}</div>
                    {s.offer && <div className="text-xs mt-1 text-green-600">{s.offer}</div>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: getStoreGradient(s.name),
                        color: '#fff'
                      }}
                    >
                      Buy
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 px-3">No stores available</div>
          )}
        </div>

        {/* optional footer: go to product page or close */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Lowest price:{' '}
            <span className="font-semibold">
              {product.store && product.store.length
                ? `₹${Math.min(...product.store.map(s => Number(s.price))).toLocaleString('en-IN')}`
                : 'N/A'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-full bg-gray-100 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper gradient mapping (same as ProductCard)
function getStoreGradient(name = '') {
  const n = name.toLowerCase();
  if (n.includes('amazon')) return 'linear-gradient(90deg,#ff7a00,#ffd199)';
  if (n.includes('meesho')) return 'linear-gradient(90deg,#ff6eb4,#d66cff)';
  if (n.includes('ajio')) return 'linear-gradient(90deg,#00c6a7,#0072ff)';
  return 'linear-gradient(90deg,#6a11cb,#2575fc)';
        }
          
