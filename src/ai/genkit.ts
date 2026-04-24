import {genkit} from 'genkit';
import openAI from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    openAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    }),
  ],
  model: 'openai/cognitivecomputations/dolphin-mixtral-8x7b',
});
