"use client";
import { createContext, useContext } from "react";

type SotDataType = {
  artist: string;
  name: string;
};

const SotDataContext = createContext<SotDataType>({
  artist: "default artist",
  name: "default name",
});

export const useSotData = () => useContext(SotDataContext);

export function SotDataProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SotDataType;
}) {
  return (
    <SotDataContext.Provider value={value}>{children}</SotDataContext.Provider>
  );
}
