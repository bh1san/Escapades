"use server";

import { z } from "zod";
import { generateFullEroticStory } from "@/ai/flows/continue-erotic-story";
import { generateStoryPrompt } from "@/ai/flows/generate-story-prompt";

const generateStorySchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
});

type FormState = {
  message: string;
  data?: { story: string };
  error?: boolean;
};

export async function handleGenerateStory(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = generateStorySchema.safeParse({
    prompt: formData.get("prompt"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map((e) => e.message).join(", "),
      error: true,
    };
  }
  
  const { prompt } = validatedFields.data;

  try {
    const result = await generateFullEroticStory({ prompt });
    return { message: "Story generated successfully.", data: { story: result } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to generate story: ${errorMessage}`, error: true };
  }
}

type GeneratePromptState = {
  prompt?: string;
  message: string;
  error?: boolean;
};

export async function handleGeneratePrompt(): Promise<GeneratePromptState> {
  try {
    const result = await generateStoryPrompt();
    return { message: "Prompt generated successfully.", prompt: result.prompt };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to generate prompt: ${errorMessage}`, error: true };
  }
}
