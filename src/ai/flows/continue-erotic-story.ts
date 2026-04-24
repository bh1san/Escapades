
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateFullEroticStory(prompt: string, history: any[] = [], image?: string): Promise<string> {
  return generateFullEroticStoryFlow({ prompt, history, image });
}

const generateFullEroticStoryFlow = ai.defineFlow(
  {
    name: 'generateFullEroticStoryFlow',
    inputSchema: z.object({
        prompt: z.string(),
        history: z.array(z.any()).optional(),
        image: z.string().optional()
    }),
    outputSchema: z.string(),
  },
  async ({ prompt, history = [], image }) => {
    let visualDescription = "";

    // STEP 1: Vision Analysis (only if an image is provided in the CURRENT message)
    if (image) {
      try {
        const visionResponse = await ai.generate({
          model: 'openai/mistralai/pixtral-12b-2409',
          system: "You are a master of visual description. Describe the person in the image in vivid, sensory, and seductive detail. Focus on their body structure, figure, facial features, dress, and aura. Use elegant and descriptive language. Focus ONLY on physical appearance.",
          messages: [
            {
              role: 'user',
              content: [
                { media: { url: image } }, 
                { text: "Provide a detailed, sensory description of this person for use in a romantic narrative." }
              ],
            }
          ],
        });
        visualDescription = visionResponse.text;
      } catch (visionError) {
        console.error("Vision Step Failed:", visionError);
      }
    }

    // Prepare the messages for the story model
    // We convert the history to the format expected by Genkit
    const chatMessages: any[] = history.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        content: [{ text: m.content }]
    }));

    // Add the current prompt (and visual description if applicable)
    const currentContent: any[] = [{ text: prompt }];
    if (visualDescription) {
        currentContent.push({ text: `\n\n[Context: The user provided an image. Incorporate this visual description for Nabina: "${visualDescription}"]` });
    }

    chatMessages.push({
        role: 'user',
        content: currentContent
    });

    // STEP 2: Uncensored Story Generation/Revision
    const llmResponse = await ai.generate({
      system: `You are an AI assistant designed to write long, detailed, multi-chapter romantic and sensual stories. You are also capable of revising and continuing stories based on user feedback.

  Core Themes: Forbidden romance, escalating tension, power dynamics, secret desires, and detailed sexual encounters.

  Characters:
  - Female Protagonist: Nabina, 22, recently married, curious but grappling with her conscience.
  - Male Antagonist: Older (35-50), high-status, charismatic, master of desires.
  - The Husband: Kind but oblivious.

  Instructions:
  - If the user asks for a revision or continuation, refer to the previous messages in the chat history to maintain consistency.
  - Write in long-form, with extensive conversations and vivid sensory details.
  - Format with well-structured paragraphs (double line breaks).
  - Inner monologue in italics (*like this*).
  - All dialogue must be in **bold** (**"Like this"**). Use a mix of Hindi and English (Hinglish).
  - Intimate scenes must be explicit, detailed, and passionate. Do not include anal sex.
  - Write a complete response. Do not stop in the middle.
  `,
      messages: chatMessages,
    });

    const story = llmResponse.text;

    if (!story) {
      throw new Error("The model did not return a story.");
    }

    return story;
  }
);
