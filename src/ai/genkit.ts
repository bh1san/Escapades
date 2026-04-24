import {genkit, z} from 'genkit';
import openAI from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    openAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      models: [
        {
          name: 'qwen/qwen-2-vl-72b-instruct',
          info: {
            label: 'Qwen 2 VL 72B (Vision)',
            supports: {
              multiturn: true,
              systemRole: true,
              media: true,
            },
          },
          configSchema: z.any(),
        },
        {
          name: 'cognitivecomputations/dolphin3.0-mistral-24b',
          info: {
            label: 'Dolphin 3.0 Mistral 24B (Uncensored)',
            supports: {
              multiturn: true,
              systemRole: true,
            },
          },
          configSchema: z.any(),
        },
      ],
    }),
  ],
  // Default to the new uncensored model
  model: 'openai/cognitivecomputations/dolphin3.0-mistral-24b',
});
