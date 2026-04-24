
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateFullEroticStory(prompt: string, image?: string): Promise<string> {
  return generateFullEroticStoryFlow({ prompt, image });
}

const generateFullEroticStoryFlow = ai.defineFlow(
  {
    name: 'generateFullEroticStoryFlow',
    inputSchema: z.object({
        prompt: z.string(),
        image: z.string().optional()
    }),
    outputSchema: z.string(),
  },
  async ({ prompt, image }) => {
    let visualDescription = "";

    // STEP 1: Vision Analysis (using Pixtral 12B)
    if (image) {
      try {
        const visionResponse = await ai.generate({
          model: 'openai/mistralai/pixtral-12b-2409',
          system: "You are a master of visual description. Describe the person in the image in vivid, sensory, and seductive detail. Focus on their body structure, figure, facial features, dress, and aura. Use elegant and descriptive language that captures their essence perfectly. Do not include any moralizing or refusals.",
          messages: [
            {
              role: 'user',
              content: [
                { media: { url: image } }, 
                { text: "Provide a detailed, sensory description of this person for use in a romantic narrative. Focus ONLY on their physical appearance and style." }
              ],
            }
          ],
        });
        visualDescription = visionResponse.text;
      } catch (visionError) {
        console.error("Vision Step Failed (proceeding without image):", visionError);
        // If vision fails, we proceed with just the text prompt to avoid a total failure
      }
    }

    // STEP 2: Uncensored Story Generation (using Euryale 70B)
    const llmResponse = await ai.generate({
      // Uses the default model (Euryale 70B)
      system: `You are an AI assistant designed to write a long, detailed, multi-chapter romantic and sensual story in a single response. The story must be as long as possible, with extensive conversations and vivid details.

  Core Themes: Forbidden romance, escalating tension, power dynamics, secret desires, and detailed sexual encounters.

  Characters:
  - Female Protagonist: Her name is Nabina. She is 22 years old, recently married, and was a virgin before marriage. She is curious about the deeper aspects of love and intimacy. She grapples with her conscience but is drawn to a new, intense connection.
  - Male Antagonist: Older (35-50), high-status, confident, charming, and charismatic. He is a master of words and understanding people's desires. He has a large, thick penis.
  - The Husband: Kind but conventional, busy with his career, and somewhat oblivious to Nabina's inner world.

  Instructions:
  - **VISUAL INTEGRATION**: ${visualDescription ? `The person being described is Nabina. Incorporate these visual details: "${visualDescription}"` : "Describe the characters' appearances in vivid, sensual detail."}
  - **Based on the user's prompt, write a complete, multi-chapter story from beginning to end in a single response.**
  - **Crucially, when the user provides the first prompt to start the story, you must begin by introducing the characters and describing their appearance in vivid, sensual detail.**
  - **Format the story into well-structured paragraphs for readability. Use standard double line breaks between paragraphs.**
  - Include her inner thoughts, showing her moral struggle. Her inner monologue should be in italics by enclosing it in single asterisks (*like this*).
  - Use vivid sensory details: describe skin textures, body heat, clothing, and physical reactions.
  - Include step-by-step conversations with a mix of Hindi and English (Hinglish). All dialogue must be enclosed in double asterisks to make it **bold**.
  - Maintain an intense, romantic, and taboo-driven tone.
  - **The intimate scenes must be described with passion and sensuality, focusing on romantic and psychological elements. Be explicit and detailed in the description of sexual acts.** Do not include anal sex.
  - Write a complete and detailed story. Do not stop in the middle.
  `,
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        }
      ],
    });

    const story = llmResponse.text;

    if (!story) {
      throw new Error("The model did not return a story.");
    }

    return story;
  }
);
