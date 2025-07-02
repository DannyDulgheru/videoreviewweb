'use server';
/**
 * @fileOverview An AI flow to summarize video feedback comments.
 *
 * - summarizeFeedback - A function that handles the feedback summarization process.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CommentSchema = z.object({
  text: z.string(),
  version: z.number(),
});

export const SummarizeFeedbackInputSchema = z.object({
  comments: z
    .array(CommentSchema)
    .describe('The list of comments to summarize.'),
  videoTitle: z.string().describe('The title of the video project.'),
});
export type SummarizeFeedbackInput = z.infer<
  typeof SummarizeFeedbackInputSchema
>;

export const SummarizeFeedbackOutputSchema = z.object({
  summary: z
    .string()
    .describe('The generated summary of the feedback comments.'),
});
export type SummarizeFeedbackOutput = z.infer<
  typeof SummarizeFeedbackOutputSchema
>;

export async function summarizeFeedback(
  input: SummarizeFeedbackInput
): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are a helpful assistant for video editors. Your task is to summarize the feedback for a video titled "{{videoTitle}}".
    
      Review the following comments and provide a clear, concise summary of the key feedback points and actionable suggestions.
      Organize the summary by video version if there are multiple versions represented in the comments.
    
      Here are the comments:
      {{#each comments}}
      - V{{version}}: "{{text}}"
      {{/each}}
      `,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
