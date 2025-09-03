
'use server';

/**
 * @fileOverview A Genkit flow for analyzing images and answering questions about them.
 *
 * - analyzeImage - A function that takes an image and a question and returns an analysis.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageInputSchema = z.object({
  image: z.string().describe("The image to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  question: z.string().describe('The question about the image.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  analysis: z.string().describe('The analysis of the image based on the question.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `Analyze the following image and answer the user's question.

Image: {{media url=image}}
Question: {{{question}}}

Provide a detailed analysis of the image based on the question.`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeImagePrompt(input);
    return output!;
  }
);
