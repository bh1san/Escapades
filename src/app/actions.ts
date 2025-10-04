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
    if (typeof result === 'string' && result.length > 0) {
      return { message: "Story generated successfully.", data: { story: result } };
    }
    // This case handles if the AI returns an empty string or something unexpected.
    return { message: "Failed to generate story: The model returned an empty response.", error: true };
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
