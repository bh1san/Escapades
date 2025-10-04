
"use server";

import { z } from "zod";
import { generateFullEroticStory } from "@/ai/flows/continue-erotic-story";
import { generateStoryPrompt } from "@/ai/flows/generate-story-prompt";

export async function handleGenerateStory(prompt: string): Promise<string> {
  const generateStorySchema = z.string().min(1, "Prompt cannot be empty.");
  
  const validatedFields = generateStorySchema.safeParse(prompt);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map((e) => e.message).join(", "));
  }

  try {
    const result = await generateFullEroticStory(validatedFields.data);
    if (typeof result === 'string' && result.length > 0) {
      return result;
    }
    throw new Error("The model returned an empty response.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate story: ${errorMessage}`);
  }
}

type GeneratePromptState = {
  prompt?: string;
  message: string;
  error?: boolean;
};

export async function handleGeneratePrompt(
  prevState: GeneratePromptState,
  formData: FormData
): Promise<GeneratePromptState> {
  try {
    const result = await generateStoryPrompt();
    if (result?.prompt) {
      return { message: "Prompt generated successfully.", prompt: result.prompt };
    }
    return { message: "Failed to generate prompt: The model returned an empty response.", error: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to generate prompt: ${errorMessage}`, error: true };
  }
}
