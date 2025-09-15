
'use server';

/**
 * @fileOverview Generates a polite message when the chatbot can't answer a question, offering suggestions.
 *
 * - generatePoliteUnknownResponse - A function that generates a polite "unknown response" message.
 * - PoliteUnknownResponseInput - The input type for the generatePoliteUnknownResponse function.
 * - PoliteUnknownResponseOutput - The return type for the generatePoliteUnknownResponse function.
 */

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
  const response = `I am sorry, but I am unable to answer your question: "${input.query}" 😥.

  Could you please try rephrasing your question or asking it in a different way? I am still under development, and learning to understand a wide range of questions. 🤔`;
  return { response };
}
