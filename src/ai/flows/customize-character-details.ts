'use server';

/**
 * @fileOverview A character customization AI agent.
 *
 * - customizeCharacter - A function that handles the character customization process.
 * - CustomizeCharacterInput - The input type for the customizeCharacter function.
 * - CustomizeCharacterOutput - The return type for the customizeCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeCharacterInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  age: z.number().describe('The age of the character.'),
  physicalAttributes: z.string().describe('The physical attributes of the character.'),
});
export type CustomizeCharacterInput = z.infer<typeof CustomizeCharacterInputSchema>;

const CustomizeCharacterOutputSchema = z.object({
  characterDescription: z.string().describe('A detailed description of the character based on the input.'),
});
export type CustomizeCharacterOutput = z.infer<typeof CustomizeCharacterOutputSchema>;

export async function customizeCharacter(input: CustomizeCharacterInput): Promise<CustomizeCharacterOutput> {
  return customizeCharacterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeCharacterPrompt',
  input: {schema: CustomizeCharacterInputSchema},
  output: {schema: CustomizeCharacterOutputSchema},
  prompt: `You are a creative writer specializing in character development.

You will use the information provided to create a detailed and vivid description of the character.

Name: {{{name}}}
Age: {{{age}}}
Physical Attributes: {{{physicalAttributes}}}

Character Description:`, // Removed triple curly braces to avoid HTML escaping
});

const customizeCharacterFlow = ai.defineFlow(
  {
    name: 'customizeCharacterFlow',
    inputSchema: CustomizeCharacterInputSchema,
    outputSchema: CustomizeCharacterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
