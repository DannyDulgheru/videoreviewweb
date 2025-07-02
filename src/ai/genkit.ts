'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GOOGLE_API_KEY) {
  console.warn(
    'GOOGLE_API_KEY environment variable not set. Genkit features will not work.'
  );
}

export const ai = genkit({
  plugins: [googleAI()],
  enableTracingAndMetrics: true,
});
