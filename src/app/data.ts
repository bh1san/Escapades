import type { Message } from "@/lib/types";

type ChatState = {
  messages: Message[];
  error?: string | null;
  pendingUserInput?: string | null;
};

const initialMessage: Message = {
  role: "model",
  content:
    "Welcome to **Story Weaver** ✨\n\nI'm your personal storyteller. Tell me a scenario, a fantasy, or a mood — and I'll craft a vivid, immersive story just for you.\n\n🔥 **Tip:** You can also upload an image of a person, and I'll weave their appearance into the narrative with seductive detail.\n\nWhat story shall we begin?",
};

export async function getInitialChatState(): Promise<ChatState> {
    return { messages: [initialMessage] };
}
