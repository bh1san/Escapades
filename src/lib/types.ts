export interface Character {
  name: string;
  age: number;
  attributes: string;
}

export interface SavedItem {
  id: string;
  type: "story" | "conversation";
  title: string;
  content: string | string[];
  savedAt: string;
}
