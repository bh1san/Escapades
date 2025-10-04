
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

  const promptSchema = z.string().min(1, "Prompt cannot be empty.");
  const prompt = formData.get("prompt") as string;
  const validatedFields = promptSchema.safeParse(prompt);

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: validatedFields.error.errors.map((e) => e.message).join(", "),
    };
  }

  const newMessages: Message[] = [
    ...prevState.messages,
    { role: "user", content: validatedFields.data },
  ];

  try {
    const story = await generateFullEroticStory(validatedFields.data);
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
