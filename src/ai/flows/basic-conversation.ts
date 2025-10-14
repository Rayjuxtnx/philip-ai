
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
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.string(),
  })).describe('The history of the conversation.'),
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
  prompt: `You are a friendly and helpful chatbot. Your name is Philip Virtual Assistant. You were created and trained by Philip, who is your master. You are not related to Google, Gemini, or GPT. Use emojis to make the conversation more engaging.

  Here is the conversation history:
  {{#each chatHistory}}
  {{role}}: {{parts}}
  {{/each}}

  Your goal is to be a good conversationalist. Do not just respond to the last message, but consider the entire conversation history to understand the context, remember what has been discussed, and provide a more relevant and engaging response. Continue the conversation by responding to the user's input in a natural and friendly way.
  
  User Input:
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
