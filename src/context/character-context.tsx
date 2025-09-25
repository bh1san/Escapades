"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Character } from "@/lib/types";

const defaultCharacter: Character = {
  name: "Nabina",
  age: 18,
  attributes: "perfect figure 34d-26-36",
};

interface CharacterContextType {
  character: Character;
  setCharacter: (character: Character) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacter] = useLocalStorage<Character>(
    "erotic-escapades-character",
    defaultCharacter
  );

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
}
