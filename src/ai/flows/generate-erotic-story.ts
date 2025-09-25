// src/ai/flows/generate-erotic-story.ts
'use server';

/**
 * @fileOverview Generates unique erotic stories based on customized plot elements.
 *
 * - generateEroticStory - A function that generates an erotic story.
 * - GenerateEroticStoryInput - The input type for the generateEroticStory function.
 * - GenerateEroticStoryOutput - The return type for the generateEroticStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEroticStoryInputSchema = z.object({
  plot: z.string().describe('The main plot or theme of the erotic story.'),
  characterName: z.string().describe('The name of the main character.'),
  characterAge: z.number().describe('The age of the main character.'),
  characterFigure: z.string().describe('Description of the character\'s figure.'),
  details: z.string().describe('Any specific details to include in the story.'),
});

export type GenerateEroticStoryInput = z.infer<typeof GenerateEroticStoryInputSchema>;

const GenerateEroticStoryOutputSchema = z.object({
  story: z.string().describe('The generated erotic story.'),
});

export type GenerateEroticStoryOutput = z.infer<typeof GenerateEroticStoryOutputSchema>;

export async function generateEroticStory(input: GenerateEroticStoryInput): Promise<GenerateEroticStoryOutput> {
  return generateEroticStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEroticStoryPrompt',
  input: {schema: GenerateEroticStoryInputSchema},
  output: {schema: GenerateEroticStoryOutputSchema},
  prompt: `You are an AI assistant designed to generate unique erotic stories based on user-provided details.

  Create a story with:
  Plot: {{{plot}}}
  Character Name: {{{characterName}}}
  Character Age: {{{characterAge}}}
  Character Figure: {{{characterFigure}}}
  Specific Details: {{{details}}}

  Write a step-by-step erotically seductive conversation with vivid details. Do not include any illegal content.
  Ensure the story is engaging, creative, and explores the provided themes in a tasteful manner.
  The story should be no more than 500 words.
  STORY:
  `,
});

const generateEroticStoryFlow = ai.defineFlow(
  {
    name: 'generateEroticStoryFlow',
    inputSchema: GenerateEroticStoryInputSchema,
    outputSchema: GenerateEroticStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
