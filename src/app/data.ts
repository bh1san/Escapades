import type { Message } from "@/lib/types";

type ChatState = {
  messages: Message[];
  error?: string | null;
  pendingUserInput?: string | null;
};

const initialMessage: Message = {
  role: "model",
  content:
    "You are an expert in writing erotic fiction. Tell me a story you would like to hear, and I will write it for you.",
};

export async function getInitialChatState(): Promise<ChatState> {
    return { messages: [initialMessage] };
}
