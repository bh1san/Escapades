import {genkit, z} from 'genkit';
import openAI from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    openAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      models: [
        {
          // Pixtral is excellent for vision and less likely to refuse "sensual" descriptions
          name: 'mistralai/pixtral-12b-2409',
          info: {
            label: 'Pixtral 12B (Vision)',
            supports: {
              multiturn: true,
              systemRole: true,
              media: true,
            },
          },
          configSchema: z.any(),
        },
        {
          // Euryale 70B is one of the best uncensored models for long-form erotic storytelling
          name: 'sao10k/l3.1-euryale-70b',
          info: {
            label: 'Euryale 70B (Uncensored Storyteller)',
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
  // Set the high-quality uncensored model as default
  model: 'openai/sao10k/l3.1-euryale-70b',
});
