'use server';

/**
 * @fileOverview Generates a creative story prompt for an erotic story.
 *
 * - generateStoryPrompt - A function that generates a story prompt.
 * - GenerateStoryPromptOutput - The return type for the generateStoryPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryPromptOutputSchema = z.object({
  prompt: z.string().describe('A creative and detailed prompt for the start of an erotic story.'),
});
export type GenerateStoryPromptOutput = z.infer<typeof GenerateStoryPromptOutputSchema>;

export async function generateStoryPrompt(): Promise<GenerateStoryPromptOutput> {
  return generateStoryPromptFlow();
}

const prompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  output: {schema: GenerateStoryPromptOutputSchema},
  system: `You are an AI assistant designed to generate creative prompts for erotic stories. The prompt should be detailed and set a clear scene.

  Core Themes: Forbidden romance, escalating tension, power dynamics, secret desires.

  Instructions:
  - Generate a single, detailed prompt that can be used to start a new story.
  - The prompt should describe a scenario, the characters involved (especially a female protagonist similar to Nabina), and a point of tension or intrigue.
  - The prompt should be written from the user's perspective, as if they are instructing the storyteller.
  - Example: "Start a story about Nabina, a recently married young woman, who feels unfulfilled. She attends a high-end art gallery opening with her oblivious husband and has a captivating, tense encounter with an older, dominant stranger who is the gallery's owner."
  `,
});

const generateStoryPromptFlow = ai.defineFlow(
  {
    name: 'generateStoryPromptFlow',
    outputSchema: GenerateStoryPromptOutputSchema,
  },
  async () => {
    const {output} = await prompt();

    if (!output) {
      throw new Error("The model did not return a response.");
    }

    return output;
  }
);
