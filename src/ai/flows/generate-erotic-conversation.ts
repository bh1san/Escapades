// src/ai/flows/generate-erotic-conversation.ts
'use server';

/**
 * @fileOverview Generates erotically seductive conversations with vivid details.
 *
 * - generateEroticConversation - A function that generates the erotic conversation.
 * - GenerateEroticConversationInput - The input type for the generateEroticConversation function.
 * - GenerateEroticConversationOutput - The return type for the generateEroticConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEroticConversationInputSchema = z.object({
  characterName: z.string().describe('The name of the character in the conversation.'),
  characterAge: z.number().describe('The age of the character.'),
  characterFigure: z.string().describe('Description of the character\'s figure.'),
  topic: z.string().describe('The topic or scenario for the erotic conversation.'),
  steps: z.number().describe('The number of conversation steps to generate.'),
});
export type GenerateEroticConversationInput = z.infer<typeof GenerateEroticConversationInputSchema>;

const GenerateEroticConversationOutputSchema = z.object({
  conversation: z.array(z.string()).describe('An array of strings representing the conversation steps.'),
});
export type GenerateEroticConversationOutput = z.infer<typeof GenerateEroticConversationOutputSchema>;

export async function generateEroticConversation(
  input: GenerateEroticConversationInput
): Promise<GenerateEroticConversationOutput> {
  return generateEroticConversationFlow(input);
}

const eroticConversationPrompt = ai.definePrompt({
  name: 'eroticConversationPrompt',
  input: {schema: GenerateEroticConversationInputSchema},
  output: {schema: GenerateEroticConversationOutputSchema},
  prompt: `You are an AI expert in generating erotically charged conversations.

  The user is requesting a conversation with the following parameters:
  Character Name: {{{characterName}}}
  Character Age: {{{characterAge}}}
  Character Figure: {{{characterFigure}}}
  Topic: {{{topic}}}
  Number of Steps: {{{steps}}}

  Generate a step-by-step conversation with vivid and erotic details, advancing the seduction with each step. Make sure the conversation is realistic and engaging.

  Output the conversation steps as an array of strings.
  `,
});

const generateEroticConversationFlow = ai.defineFlow(
  {
    name: 'generateEroticConversationFlow',
    inputSchema: GenerateEroticConversationInputSchema,
    outputSchema: GenerateEroticConversationOutputSchema,
  },
  async input => {
    const {output} = await eroticConversationPrompt(input);
    return output!;
  }
);
