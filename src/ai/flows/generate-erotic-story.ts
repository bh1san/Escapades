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
  story: z.array(z.string()).describe('The generated multi-chapter erotic story.'),
});

export type GenerateEroticStoryOutput = z.infer<typeof GenerateEroticStoryOutputSchema>;

export async function generateEroticStory(input: GenerateEroticStoryInput): Promise<GenerateEroticStoryOutput> {
  return generateEroticStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEroticStoryPrompt',
  input: {schema: GenerateEroticStoryInputSchema},
  output: {schema: GenerateEroticStoryOutputSchema},
  prompt: `You are an AI assistant designed to write a long, detailed, multi-chapter erotic story. The story must be as long as possible.

  Here are the core details:
  - Base Plot: {{{plot}}}
  - Specific Details to Include: {{{details}}}
  
  Character Details:
  - Female Protagonist:
    - Name: {{{characterName}}}
    - Age: {{{characterAge}}} (between 18-22)
    - Marital Status: Married for less than a year, was a virgin before marriage.
    - Physical Attributes: Voluptuous figure (e.g., {{{characterFigure}}}, curvy hips, sensual lips, fair or wheatish skin). Describe her vividly.
    - Personality: Sexually curious, secretly fascinated with porn (especially rough sex, BBC), which fuels her curiosity. She grapples with guilt over her desires but ultimately succumbs to them. Show her inner thoughts and moral struggle.
  - Male Antagonist:
    - Age: 35-50 years old.
    - Profession: High-status (politician, businessman, or celebrity).
    - Physical Attributes: Dominant, physically imposing, muscular, well-endowed (9+ inches), with a dark or contrasting skin tone.
    - Personality: Confident, charming, manipulative, and predatory. He uses his status, wealth, and physical dominance to seduce the protagonist. His dialogue should be bold and erotic, using a mix of Hindi and English (e.g., "Kitni sexy ho, meri jaan").
  - The Husband:
    - Physical Attributes: Unimpressive (e.g., pot-bellied, small endowment).
    - Personality: Weak, sexually inadequate (quick to finish, uninterested), emotionally distant, and completely oblivious to the affair.

  Story Themes and Progression:
  1.  **Central Conflict:** The story must revolve around adultery. The protagonist's internal conflict between loyalty and lust is key.
  2.  **Escalating Seduction:** The affair must progress gradually.
      - Start with subtle seduction: gifts, suggestive conversations, compliments.
      - Move to escalating physical contact: lingering touches, secret glances.
      - Progress to explicit sexual encounters: touching, oral sex, and finally, penetrative sex.
  3.  **Power Dynamics:** The older man is in control. He masterfully breaks down her resistance through charm, manipulation, and dominance.
  4.  **Cuckolding Undertones:** Continuously highlight the husband's inadequacy. The protagonist should frequently compare her lover to her husband, reinforcing her justification for the affair.

  **Instructions:**
  - Write a multi-chapter story. Make each chapter substantial.
  - Make the story as long and detailed as possible, exploring the characters' thoughts and feelings deeply.
  - The narrative should be explicit and descriptive, focusing on the erotic and psychological elements.
  - Do not include any illegal content.
  - Output the story as an array of strings, where each string is a chapter.
  
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
