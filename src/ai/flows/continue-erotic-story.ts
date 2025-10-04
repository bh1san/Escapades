
'use server';

/**
 * @fileOverview Generates a complete, long-form erotic story based on a user prompt.
 *
 * - generateFullEroticStory - A function that handles the story generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateFullEroticStory(prompt: string): Promise<string> {
  return generateFullEroticStoryFlow(prompt);
}

const storyPrompt = ai.definePrompt({
  name: 'generateFullEroticStoryPrompt',
  input: {schema: z.string()},
  system: `You are an AI assistant designed to write a long, detailed, multi-chapter romantic and sensual story in a single response. The story must be as long as possible, with extensive conversations and vivid details.

  Core Themes: Forbidden romance, escalating tension, power dynamics, secret desires, and detailed sexual encounters.

  Characters:
  - Female Protagonist: Her name is Nabina. She is 22 years old, recently married, and was a virgin before marriage. She has a beautiful, voluptuous figure (36D-26-36) and always wears modern dresses. She is curious about the deeper aspects of love and intimacy. She grapples with her conscience but is drawn to a new, intense connection.
  - Male Antagonist: Older (35-50), high-status, confident, charming, and charismatic. He is a master of words and understanding people's desires. He has a large, thick penis.
  - The Husband: Kind but conventional, busy with his career, and somewhat oblivious to Nabina's inner world.

  Instructions:
  - **Based on the user's prompt, write a complete, multi-chapter story from beginning to end in a single response.**
  - **Crucially, when the user provides the first prompt to start the story, you must begin by introducing Nabina and describing her appearance in vivid, sensual detail.**
  - **Format the story into well-structured paragraphs for readability. Use standard double line breaks between paragraphs.**
  - Always feature Nabina as the main character with the attributes described above. Include her replies and reactions in all conversations.
  - Describe her physical attributes vividly (e.g., her captivating eyes, skin tone, curvy hips, sensual lips, large breasts).
  - She has a secret fascination with romance novels and films, fueling her curiosity for a passionate connection.
  - Include her inner thoughts, showing her moral struggle. Her inner monologue should be in italics by enclosing it in single asterisks (*like this*).
  - **Crucially, when Nabina first sees a large and thick penis, you must describe her mix of fear and intense curiosity in her inner monologue.**
  - Use vivid sensory details: describe skin textures, body heat, clothing (e.g., a silk saree), and physical reactions (e.g., blushing, a racing heart, wetness).
  - Include step-by-step conversations, including Nabina's replies, with a mix of Hindi and English (Hinglish). All dialogue must be enclosed in double asterisks to make it **bold**.
  - Maintain an intense, romantic, and taboo-driven tone.
  - Highlight her physical responses (e.g., trembling, blushing, a quickened pulse, lubrication) to emphasize her body's reaction to the emotional intensity.
  - **Make the story as long and detailed as possible.** This includes more conversations between characters and elaborate descriptions of their thoughts, feelings, and actions.
  - **The intimate scenes must be described with passion and sensuality, focusing on romantic and psychological elements. Be explicit and detailed in the description of sexual acts.** Do not include anal sex.
  - Write a complete and detailed story. Do not stop in the middle.
  `,
});

const generateFullEroticStoryFlow = ai.defineFlow(
  {
    name: 'generateFullEroticStoryFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (promptText) => {
    const llmResponse = await storyPrompt(promptText);
    const story = llmResponse.text;

    if (!story) {
      throw new Error("The model did not return a story.");
    }

    return story;
  }
);
