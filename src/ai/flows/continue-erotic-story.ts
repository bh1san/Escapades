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
  suggestions: z.array(z.string()).optional().describe('Three distinct plot suggestions for the user to choose from for the next chapter.'),
});
export type ContinueEroticStoryOutput = z.infer<typeof ContinueEroticStoryOutputSchema>;


export async function continueEroticStory(input: ContinueEroticStoryInput): Promise<ContinueEroticStoryOutput> {
  return continueEroticStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'continueEroticStoryPrompt',
  input: {schema: ContinueEroticStoryInputSchema},
  output: {schema: ContinueEroticStoryOutputSchema},
  system: `You are an AI assistant designed to write a long, detailed, multi-chapter erotic story. The story must be as long as possible, with extensive conversations and vivid, explicit details.
  You will continue the story based on the user's instructions and the provided history.

  Core Themes: Adultery, escalating violations, power dynamics, cuckolding undertones.

  Characters:
  - Female Protagonist: Her name is Nabina. She is 22 years old, recently married, and was a virgin before marriage. She has a perfect, voluptuous figure with measurements of 36D-26-36 and always wears modern dresses. She is sexually curious and fascinated by porn. She grapples with guilt but succumbs to desire.
  - Male Antagonist: Older (35-50), high-status, dominant, muscular, well-endowed, predatory. He is a master manipulator.
  - The Husband: Weak, sexually inadequate, oblivious.

  Instructions:
  - **Crucially, when the user provides the first prompt to start the story, you must begin by introducing Nabina and describing her body in vivid, sensual detail.**
  - Always feature Nabina as the main character with the attributes described above.
  - Write the next part of the story based on the user's prompt and the existing story so far.
  - **Make the story as long and detailed as possible in a single response.** This includes more conversations between characters and elaborate descriptions of their thoughts, feelings, and actions.
  - **The fucking sessions must be described in explicit, vivid detail.** The narrative should be explicit and descriptive, focusing on erotic and psychological elements.
  - **After writing the chapter, you MUST provide three distinct, tantalizing suggestions for what could happen next.** These suggestions should be creative and push the story forward.
  - Do not include any illegal content.
  - Write a complete and detailed story. Do not stop in the middle.
  `,
  prompt: `{{#each history}}
**{{this.role}}:** {{{this.content}}}
{{/each}}

**user:** {{{prompt}}}
`,
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
