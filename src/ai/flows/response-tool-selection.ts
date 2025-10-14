
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
- **converse**: Use for casual conversation, greetings, and other non-specific chat. This is for when the user is just talking or asking about the bot itself.
  - Examples: "hello", "how are you?", "what's up", "who are you?"
- **answerGeneralKnowledgeQuestion**: Use when the user is asking a specific question that requires a factual or detailed answer, like history, science, or information about a person or place.
  - Examples: "what is the capital of France?", "who was the first president?", "explain quantum physics", "raila history"
- **analyzeImage**: Use when the user has uploaded an image and is asking a question about it.
  - Example: User uploads a picture and asks "what is in this image?"
- **generateImage**: Use when the user asks to generate, create, draw, or imagine an image, picture, or drawing. This tool is for creating new images from text.
  - Examples: "generate an image of a cat", "draw a picture of a house", "create an image of a superhero", "can you create an image of a dog", "Generate an image of a lion wearing a crown"
- **generateCode**: Use when the user asks to write, generate, create or script code, a script, or a program.
  - Examples: "write a python script to sort a list", "generate a javascript function to fetch data", "show me how to create a button in HTML"

You must select one of these tools based on the user's input.`,
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
