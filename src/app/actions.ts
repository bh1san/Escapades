
"use server";

import { z } from "zod";
import { generateFullEroticStory } from "@/ai/flows/continue-erotic-story";
import { generateStoryPrompt } from "@/ai/flows/generate-story-prompt";
import type { Message } from "@/lib/types";

type ChatState = {
  messages: Message[];
  error?: string | null;
  pendingUserInput?: string | null;
};

export async function handleChat(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const formAction = formData.get("action");
  
  if (formAction === "generate_prompt") {
    try {
      const result = await generateStoryPrompt();
      if (result?.prompt) {
        return { 
          messages: prevState.messages,
          pendingUserInput: result.prompt,
        };
      }
      return { 
        ...prevState,
        error: "The model did not return a valid prompt."
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      return {
        ...prevState,
        error: `Failed to generate prompt: ${errorMessage}`,
      };
    }
  }

  const prompt = formData.get("prompt") as string;
  const historyStr = formData.get("history") as string;
  const imageStr = formData.get("image") as string;
  
  const finalPrompt = prompt.trim() ? prompt : (imageStr ? "Look at this image. Analyze it intensely. Mention the figure, body structure, dress, and aura in vivid, sensory, and seductive detail, and weave this seamlessly into our story." : "");

  if (!finalPrompt && !imageStr) {
    return {
      ...prevState,
      error: "Prompt or image cannot be empty.",
    };
  }

  let historyMessages = prevState.messages;
  if (historyStr) {
      try {
          historyMessages = JSON.parse(historyStr);
      } catch (e) {
          console.error("Failed to parse chat history:", e);
      }
  }

  const newMessages: Message[] = [
    ...historyMessages,
    { role: "user", content: finalPrompt, image: imageStr || undefined },
  ];

  try {
    const story = await generateFullEroticStory(finalPrompt, historyMessages, imageStr || undefined);
    if (typeof story === 'string' && story.length > 0) {
      return {
        messages: [...newMessages, { role: "model", content: story }],
      };
    }
    return { 
      messages: newMessages,
      error: "The model returned an empty story."
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { 
        messages: newMessages.slice(0, -1), // Remove user message on error
        error: `Failed to generate story: ${errorMessage}` 
    };
  }
}
