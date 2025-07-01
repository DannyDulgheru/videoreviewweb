'use server';

/**
 * @fileOverview Summarizes video comments using AI to identify key feedback points.
 *
 * - summarizeComments - A function that takes comments as input and returns a summary.
 * - SummarizeCommentsInput - The input type for the summarizeComments function.
 * - SummarizeCommentsOutput - The return type for the summarizeComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommentsInputSchema = z.object({
  comments: z
    .string()
    .describe('A string containing all the comments for a video.'),
});
export type SummarizeCommentsInput = z.infer<typeof SummarizeCommentsInputSchema>;

const SummarizeCommentsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summarized list of the key feedback points from the comments.'),
});
export type SummarizeCommentsOutput = z.infer<typeof SummarizeCommentsOutputSchema>;

export async function summarizeComments(input: SummarizeCommentsInput): Promise<SummarizeCommentsOutput> {
  return summarizeCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCommentsPrompt',
  input: {schema: SummarizeCommentsInputSchema},
  output: {schema: SummarizeCommentsOutputSchema},
  prompt: `You are an AI expert in summarizing video feedback.

  Given the following comments, generate a summarized list of the key feedback points. Focus on identifying areas for improvement for the video creator.

  Comments: {{{comments}}}
  Summary: `,
});

const summarizeCommentsFlow = ai.defineFlow(
  {
    name: 'summarizeCommentsFlow',
    inputSchema: SummarizeCommentsInputSchema,
    outputSchema: SummarizeCommentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
