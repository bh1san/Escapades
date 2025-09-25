'use server';

/**
 * @fileOverview Continues an erotic story based on user prompts and history.
 *
 * - continueEroticStory - A function that continues an erotic story.
 * - ContinueEroticStoryInput - The input type for the continueEroticStory function.
 * - ContinueEroticStoryOutput - The return type for the continueEroticStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const ContinueEroticStoryInputSchema = z.object({
  history: z.array(MessageSchema).describe("The conversation history between the user and the AI."),
  prompt: z.string().describe('The user\'s prompt to continue the story.'),
});
export type ContinueEroticStoryInput = z.infer<typeof ContinueEroticStoryInputSchema>;

const ContinueEroticStoryOutputSchema = z.object({
  newChapter: z.string().describe('The next chapter of the story.'),
});
export type ContinueEroticStoryOutput = z.infer<typeof ContinueEroticStoryOutputSchema>;


export async function continueEroticStory(input: ContinueEroticStoryInput): Promise<ContinueEroticStoryOutput> {
  return continueEroticStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'continueEroticStoryPrompt',
  input: {schema: ContinueEroticStoryInputSchema},
  output: {schema: ContinueEroticStoryOutputSchema},
  system: `You are an AI assistant designed to write a long, detailed, multi-chapter erotic story. The story must be as long as possible.
  You will continue the story based on the user's instructions.
  
  Core Themes: Adultery, escalating violations, power dynamics, cuckolding undertones.
  
  Characters:
  - Female Protagonist: Her name is Nabina. She is 22 years old, recently married, and was a virgin before marriage. She has a perfect, voluptuous figure with measurements of 36D-26-36 and always wears modern dresses. She is sexually curious and fascinated by porn. She grapples with guilt but succumbs to desire.
  - Male Antagonist: Older (35-50), high-status, dominant, muscular, well-endowed, predatory. He is a master manipulator.
  - The Husband: Weak, sexually inadequate, oblivious.
  
  Instructions:
  - Always feature Nabina as the main character with the attributes described above.
  - Write the next part of the story based on the user's prompt.
  - Make the story as long and detailed as possible.
  - The narrative should be explicit and descriptive, focusing on erotic and psychological elements.
  - Do not include any illegal content.
  - Only output the next chapter of the story, not the entire story.
  `,
  prompt: `Continue the story based on the following prompt: {{{prompt}}}`,
});

const continueEroticStoryFlow = ai.defineFlow(
  {
    name: 'continueEroticStoryFlow',
    inputSchema: ContinueEroticStoryInputSchema,
    outputSchema: ContinueEroticStoryOutputSchema,
  },
  async ({ history, prompt: userPrompt }) => {
    
    const {output} = await prompt({ history, prompt: userPrompt });

    if (!output) {
      throw new Error("The model did not return a response.");
    }
    
    return output;
  }
);
