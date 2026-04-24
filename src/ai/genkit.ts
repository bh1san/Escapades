import {genkit, z} from 'genkit';
import openAI from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    openAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      models: [
        {
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
          // MythoMax is the "gold standard" for unfiltered erotic storytelling on OpenRouter
          name: 'gryphe/mythomax-l2-13b',
          info: {
            label: 'MythoMax 13B (Unfiltered)',
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
  // Use MythoMax as the default story generator
  model: 'openai/gryphe/mythomax-l2-13b',
});
