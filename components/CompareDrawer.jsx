"use client";

import { createContext, useContext, useState } from "react";

export const DrawerContext = createContext(null);

export function DrawerProvider({ children }) {
  const [openDrawer, setOpenDrawer] = useState(null); // "category" | "filter" | null
  const [activeCategory, setActiveCategory] = useState("all");
  const [filters, setFilters] = useState(null);

  return (
    <DrawerContext.Provider
      value={{
        openDrawer,
        setOpenDrawer,
        activeCategory,
        setActiveCategory,
        filters,
        setFilters,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used within DrawerProvider");
  }
  return ctx;
}
