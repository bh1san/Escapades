import {genkit} from 'genkit';
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
            label: 'Qwen 2 VL 72B',
            supports: {
              multiturn: true,
              systemRole: true,
              media: true,
            },
          },
        },
      ],
    }),
  ],
  model: 'openai/qwen/qwen-2-vl-72b-instruct',
});
