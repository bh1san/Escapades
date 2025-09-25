"use server";

import { z } from "zod";
import { continueEroticStory } from "@/ai/flows/continue-erotic-story";
import type { Message } from "@/lib/types";

const continueStorySchema = z.object({
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    content: z.string(),
  })),
  prompt: z.string().min(1, "Prompt cannot be empty."),
});

type FormState = {
  message: string;
  data?: { newChapter: string };
  error?: boolean;
};

export async function handleContinueStory(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  let history: Message[];
  try {
    const historyString = formData.get("history") as string;
    history = JSON.parse(historyString);
  } catch (e) {
    return { message: "Invalid chat history provided.", error: true };
  }

  const validatedFields = continueStorySchema.safeParse({
    history,
    prompt: formData.get("prompt"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map((e) => e.message).join(", "),
      error: true,
    };
  }
  
  const { history: validatedHistory, prompt } = validatedFields.data;

  // Filter out the initial system message if it exists
  const conversationHistory = validatedHistory.filter(
    (msg, index) => !(index === 0 && msg.role === 'model' && msg.content.startsWith('You are an expert'))
  );

  try {
    const result = await continueEroticStory({
      history: conversationHistory,
      prompt,
    });
    return { message: "Story continued successfully.", data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to continue story: ${errorMessage}`, error: true };
  }
}
