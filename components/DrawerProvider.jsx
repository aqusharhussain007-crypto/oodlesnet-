"use client";

import { createContext, useState } from "react";
import CategoryDrawer from "@/components/CategoryDrawer";
import FilterDrawer from "@/components/FilterDrawer";

export const DrawerContext = createContext(null);

export default function DrawerProvider({ children }) {
  const [openCategory, setOpenCategory] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <DrawerContext.Provider
      value={{
        openCategory,
        setOpenCategory,
        openFilter,
        setOpenFilter,
      }}
    >
      {/* App UI */}
      {children}

      {/* ✅ GLOBAL DRAWERS (mounted once, work everywhere) */}
      {openCategory && (
        <CategoryDrawer onClose={() => setOpenCategory(false)} />
      )}

      {openFilter && (
        <FilterDrawer onClose={() => setOpenFilter(false)} />
      )}
    </DrawerContext.Provider>
  );
      }
      
