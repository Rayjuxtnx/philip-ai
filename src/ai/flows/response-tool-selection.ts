
'use server';

/**
 * @fileOverview A tool selection mechanism to pick the most relevant response for any user input.
 *
 * - selectResponseTool - A function that handles the selection of the most relevant response tool.
 * - SelectResponseToolInput - The input type for the selectResponseTool function.
 * - SelectResponseToolOutput - The return type for the selectResponseTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SelectResponseToolInputSchema = z.object({
  userInput: z.string().describe('The user input to be processed.'),
  availableTools: z.array(z.string()).describe('The list of available tools.'),
});
export type SelectResponseToolInput = z.infer<typeof SelectResponseToolInputSchema>;

const SelectResponseToolOutputSchema = z.object({
  selectedTool: z.string().describe('The name of the tool selected to respond to the user input.'),
});
export type SelectResponseToolOutput = z.infer<typeof SelectResponseToolOutputSchema>;

export async function selectResponseTool(input: SelectResponseToolInput): Promise<SelectResponseToolOutput> {
  return selectResponseToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'selectResponseToolPrompt',
  input: {schema: SelectResponseToolInputSchema},
  output: {schema: SelectResponseToolOutputSchema},
  prompt: `Given the user input: "{{userInput}}", and the available tools: {{availableTools}}, select the most appropriate tool to respond to the user. Just respond with the name of the tool.

Here are the tools and their purposes:
- **converse**: Use for casual conversation, greetings, and other non-specific chat.
- **answerGeneralKnowledgeQuestion**: Use when the user is asking a specific question that requires a factual or detailed answer.
- **analyzeImage**: Use when the user has uploaded an image and is asking a question about it.
- **generateImage**: Use when the user asks to generate, create, or draw an image.
- **generateCode**: Use when the user asks to write, generate, or create code.

You must select one of these tools.`,
});

const selectResponseToolFlow = ai.defineFlow(
  {
    name: 'selectResponseToolFlow',
    inputSchema: SelectResponseToolInputSchema,
    outputSchema: SelectResponseToolOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
