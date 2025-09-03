// src/ai/flows/polite-unknown-response.ts
'use server';

/**
 * @fileOverview Generates a polite message when the chatbot can't answer a question, offering suggestions.
 *
 * - generatePoliteUnknownResponse - A function that generates a polite "unknown response" message.
 * - PoliteUnknownResponseInput - The input type for the generatePoliteUnknownResponse function.
 * - PoliteUnknownResponseOutput - The return type for the generatePoliteUnknownResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PoliteUnknownResponseInputSchema = z.object({
  query: z.string().describe('The user query that the chatbot could not answer.'),
});
export type PoliteUnknownResponseInput = z.infer<typeof PoliteUnknownResponseInputSchema>;

const PoliteUnknownResponseOutputSchema = z.object({
  response: z.string().describe('A polite message indicating that the chatbot could not answer the question, with suggestions for rephrasing or re-asking.'),
});
export type PoliteUnknownResponseOutput = z.infer<typeof PoliteUnknownResponseOutputSchema>;

export async function generatePoliteUnknownResponse(input: PoliteUnknownResponseInput): Promise<PoliteUnknownResponseOutput> {
  return politeUnknownResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'politeUnknownResponsePrompt',
  input: {schema: PoliteUnknownResponseInputSchema},
  output: {schema: PoliteUnknownResponseOutputSchema},
  prompt: `I am sorry, but I am unable to answer your question: "{{query}}" 😥.

  Could you please try rephrasing your question or asking it in a different way? I am still under development, and learning to understand a wide range of questions. 🤔`,
});

const politeUnknownResponseFlow = ai.defineFlow(
  {
    name: 'politeUnknownResponseFlow',
    inputSchema: PoliteUnknownResponseInputSchema,
    outputSchema: PoliteUnknownResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
