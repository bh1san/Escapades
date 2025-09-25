"use server";

import { z } from "zod";
import { generateEroticStory } from "@/ai/flows/generate-erotic-story";
import { generateEroticConversation } from "@/ai/flows/generate-erotic-conversation";
import type { Character } from "@/lib/types";

const storySchema = z.object({
  plot: z.string().min(10, "Please provide a more detailed plot."),
  details: z.string().optional(),
});

const conversationSchema = z.object({
  topic: z.string().min(10, "Please provide a more detailed topic."),
  steps: z.coerce.number().min(2, "Must have at least 2 steps.").max(10, "Cannot exceed 10 steps."),
});

type FormState = {
  message: string;
  data?: any;
  error?: boolean;
};

export async function handleGenerateStory(
  character: Character,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = storySchema.safeParse({
    plot: formData.get("plot"),
    details: formData.get("details"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map((e) => e.message).join(", "),
      error: true,
    };
  }

  try {
    const result = await generateEroticStory({
      plot: validatedFields.data.plot,
      details: validatedFields.data.details || "None",
      characterName: character.name,
      characterAge: character.age,
      characterFigure: character.attributes,
    });
    return { message: "Story generated successfully.", data: result };
  } catch (error) {
    return { message: "Failed to generate story. Please try again.", error: true };
  }
}

export async function handleGenerateConversation(
  character: Character,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = conversationSchema.safeParse({
    topic: formData.get("topic"),
    steps: formData.get("steps"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map((e) => e.message).join(", "),
      error: true,
    };
  }

  try {
    const result = await generateEroticConversation({
      topic: validatedFields.data.topic,
      steps: validatedFields.data.steps,
      characterName: character.name,
      characterAge: character.age,
      characterFigure: character.attributes,
    });
    return { message: "Conversation generated successfully.", data: result };
  } catch (error) {
    return { message: "Failed to generate conversation. Please try again.", error: true };
  }
}
