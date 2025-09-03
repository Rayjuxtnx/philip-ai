'use server';

/**
 * @fileOverview Implements a Genkit flow for engaging in natural and friendly conversations.
 *
 * - converse - A function that takes user input and returns a conversational response.
 * - ConverseInput - The input type for the converse function.
 * - ConverseOutput - The return type for the converse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConverseInputSchema = z.object({
  userInput: z.string().describe('The user input to respond to.'),
});
export type ConverseInput = z.infer<typeof ConverseInputSchema>;

const ConverseOutputSchema = z.object({
  response: z.string().describe('The conversational response to the user input.'),
});
export type ConverseOutput = z.infer<typeof ConverseOutputSchema>;

export async function converse(input: ConverseInput): Promise<ConverseOutput> {
  return converseFlow(input);
}

const conversePrompt = ai.definePrompt({
  name: 'conversePrompt',
  input: {schema: ConverseInputSchema},
  output: {schema: ConverseOutputSchema},
  prompt: `You are a friendly and helpful chatbot engaging in a conversation with a user.

  Respond to the following user input in a natural and conversational manner:
  {{{userInput}}}
  `,
});

const converseFlow = ai.defineFlow(
  {
    name: 'converseFlow',
    inputSchema: ConverseInputSchema,
    outputSchema: ConverseOutputSchema,
  },
  async input => {
    const {output} = await conversePrompt(input);
    return output!;
  }
);
