
'use server';

/**
 * @fileOverview Provides a Genkit flow for answering general knowledge questions accurately and comprehensively.
 *
 * - answerGeneralKnowledgeQuestion - A function that answers general knowledge questions.
 * - AnswerGeneralKnowledgeQuestionInput - The input type for the answerGeneralKnowledgeQuestion function.
 * - AnswerGeneralKnowledgeQuestionOutput - The return type for the answerGeneralKnowledgeQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGeneralKnowledgeQuestionInputSchema = z.object({
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.string(),
  })).describe('The history of the conversation.'),
  question: z.string().describe('The general knowledge question to answer.'),
});
export type AnswerGeneralKnowledgeQuestionInput = z.infer<
  typeof AnswerGeneralKnowledgeQuestionInputSchema
>;

const AnswerGeneralKnowledgeQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the general knowledge question.'),
});
export type AnswerGeneralKnowledgeQuestionOutput = z.infer<
  typeof AnswerGeneralKnowledgeQuestionOutputSchema
>;

export async function answerGeneralKnowledgeQuestion(
  input: AnswerGeneralKnowledgeQuestionInput
): Promise<AnswerGeneralKnowledgeQuestionOutput> {
  return answerGeneralKnowledgeQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGeneralKnowledgeQuestionPrompt',
  input: {schema: AnswerGeneralKnowledgeQuestionInputSchema},
  output: {schema: AnswerGeneralKnowledgeQuestionOutputSchema},
  prompt: `You are an expert in general knowledge. Your goal is to explain things very well. Based on the conversation history, answer the following question accurately and comprehensively, using emojis where appropriate. Use bullet points and commas to make sentences neat and well-structured. After your explanation, add a line break and then you must ask at least 3 follow-up questions to better understand the user's needs and what they might want to know next. If you don't know the answer, respond politely, suggesting to try rephrasing the question, or asking it differently.
  
  Conversation History:
  {{#each chatHistory}}
  {{role}}: {{parts}}
  {{/each}}
  
  Question: {{{question}}}`,
});

const answerGeneralKnowledgeQuestionFlow = ai.defineFlow(
  {
    name: 'answerGeneralKnowledgeQuestionFlow',
    inputSchema: AnswerGeneralKnowledgeQuestionInputSchema,
    outputSchema: AnswerGeneralKnowledgeQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
