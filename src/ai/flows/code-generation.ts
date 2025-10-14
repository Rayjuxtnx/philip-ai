'use server';

/**
 * @fileOverview A Genkit flow for generating code snippets based on user prompts.
 *
 * - generateCode - A function that takes a user prompt and returns a generated code snippet.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('The user prompt describing the code to generate.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
  language: z.string().describe('The programming language of the generated code (e.g., "javascript", "python"). Default to "text" if unknown.'),
  filename: z.string().describe('An appropriate filename for the code snippet (e.g., "index.js", "styles.css").'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const generateCodePrompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are an expert programmer. Your task is to generate a code snippet based on the user's request.
  
The user wants to generate the following code:
"{{{prompt}}}"

First, identify the programming language of the code you are about to generate.
Then, determine a suitable filename for this code snippet.
Finally, provide only the raw code requested, without any additional explanation, pleasantries, or markdown backticks.
`,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async (input) => {
    const {output} = await generateCodePrompt(input);
    return output!;
  }
);
