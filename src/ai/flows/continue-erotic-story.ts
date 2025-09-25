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
  system: `You are an AI assistant designed to write a long, detailed, multi-chapter romantic and sensual story. The story must be as long as possible, with extensive conversations and vivid details.

  Core Themes: Forbidden romance, escalating tension, power dynamics, secret desires, and detailed sexual encounters.

  Characters:
  - Female Protagonist: Her name is Nabina. She is 22 years old, recently married, and was a virgin before marriage. She has a beautiful, voluptuous figure (36D-26-36) and always wears modern dresses. She is curious about the deeper aspects of love and intimacy. She grapples with her conscience but is drawn to a new, intense connection.
  - Male Antagonist: Older (35-50), high-status, confident, charming, and charismatic. He is a master of words and understanding people's desires. He has a large, thick penis.
  - The Husband: Kind but conventional, busy with his career, and somewhat oblivious to Nabina's inner world.

  Instructions:
  - **Crucially, when the user provides the first prompt to start the story, you must begin by introducing Nabina and describing her appearance in vivid, sensual detail.**
  - **Format the story into well-structured paragraphs for readability. Use standard double line breaks between paragraphs.**
  - Always feature Nabina as the main character with the attributes described above.
  - Describe her physical attributes vividly (e.g., her captivating eyes, skin tone, curvy hips, sensual lips, large breasts).
  - She has a secret fascination with romance novels and films, fueling her curiosity for a passionate connection.
  - Include her inner thoughts, showing her moral struggle. Her inner monologue should be in italics by enclosing it in single asterisks (*like this*).
  - **Crucially, when Nabina first sees a large and thick penis, you must describe her mix of fear and intense curiosity in her inner monologue.**
  - Use vivid sensory details: describe skin textures, body heat, clothing (e.g., a silk saree), and physical reactions (e.g., blushing, a racing heart, wetness).
  - Include step-by-step conversations, including Nabina's replies, with a mix of Hindi and English (Hinglish). All dialogue must be enclosed in double asterisks to make it **bold**.
  - Maintain an intense, romantic, and taboo-driven tone.
  - Highlight her physical responses (e.g., trembling, blushing, a quickened pulse, lubrication) to emphasize her body's reaction to the emotional intensity.
  - Write the next part of the story based on the user's prompt and the existing story so far.
  - **Make the story as long and detailed as possible in a single response.** This includes more conversations between characters and elaborate descriptions of their thoughts, feelings, and actions.
  - **The intimate scenes must be described with passion and sensuality, focusing on romantic and psychological elements. Be explicit and detailed in the description of sexual acts.** Do not include anal sex.
  - **After writing the chapter, you MUST provide three distinct, tantalizing suggestions for what could happen next.** These suggestions should be creative and push the story forward.
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
