"use client";

import { createContext, useState } from "react";

export const DrawerContext = createContext();

export default function DrawerProvider({ children }) {
  const [openFilter, setOpenFilter] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  return (
    <DrawerContext.Provider
      value={{
        openFilter,
        setOpenFilter,
        openCategory,
        setOpenCategory,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}
