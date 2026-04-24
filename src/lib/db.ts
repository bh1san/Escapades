import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { Message } from "./types";

export async function saveChat(chatId: string, messages: Message[]) {
  const chatRef = doc(db, "chats", chatId);
  try {
    const docSnap = await getDoc(chatRef);
    if (docSnap.exists()) {
      await updateDoc(chatRef, {
        messages: messages,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(chatRef, {
        messages: messages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error saving chat to Firestore:", error);
  }
}

export async function getChat(chatId: string): Promise<Message[] | null> {
  const chatRef = doc(db, "chats", chatId);
  try {
    const docSnap = await getDoc(chatRef);
    if (docSnap.exists()) {
      return docSnap.data().messages as Message[];
    }
  } catch (error) {
    console.error("Error fetching chat from Firestore:", error);
  }
  return null;
}
