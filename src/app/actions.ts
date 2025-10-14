
'use server';

import { converse } from '@/ai/flows/basic-conversation';
import { answerGeneralKnowledgeQuestion } from '@/ai/flows/general-knowledge-qa';
import { generatePoliteUnknownResponse } from '@/ai/flows/polite-unknown-response';
import { selectResponseTool } from '@/ai/flows/response-tool-selection';
import { analyzeImage } from '@/ai/flows/image-analysis';
import { generateImage } from '@/ai/flows/image-generation';
import { generateCode } from '@/ai/flows/code-generation';

const AVAILABLE_TOOLS = {
  CONVERSE: 'converse',
  QA: 'answerGeneralKnowledgeQuestion',
  ANALYZE_IMAGE: 'analyzeImage',
  GENERATE_IMAGE: 'generateImage',
  CODE_GENERATION: 'generateCode',
};

export async function getAiResponse(chatHistory: { role: 'user' | 'model', parts: string }[], newMessage: string, imageUrl?: string): Promise<{content: string, imageUrl?: string, isCode?: boolean, codeLanguage?: string}> {
  const userInput = newMessage;
  try {
    if (imageUrl) {
      const response = await analyzeImage({ image: imageUrl, question: userInput });
      return { content: response.analysis };
    }

    const { selectedTool } = await selectResponseTool({
      userInput,
      availableTools: Object.values(AVAILABLE_TOOLS),
    });

    const conversationHistory = chatHistory.slice(0, -1);

    switch (selectedTool) {
      case AVAILABLE_TOOLS.CONVERSE:
        const conversationResponse = await converse({ userInput, chatHistory: conversationHistory });
        return { content: conversationResponse.response };

      case AVAILABLE_TOOLS.QA:
        const qaResponse = await answerGeneralKnowledgeQuestion({ question: userInput, chatHistory: conversationHistory });
        return { content: qaResponse.answer };
      
      case AVAILABLE_TOOLS.GENERATE_IMAGE:
        const imageResponse = await generateImage({ prompt: userInput });
        const response: { content: string, imageUrl?: string } = { content: `Here is the image you asked for.`};
        if (imageResponse.imageUrl) {
          response.imageUrl = imageResponse.imageUrl;
        }
        return response;

      case AVAILABLE_TOOLS.CODE_GENERATION:
        const codeResponse = await generateCode({ prompt: userInput });
        return { content: codeResponse.code, isCode: true, codeLanguage: codeResponse.language };

      default:
        const unknownResponse = await generatePoliteUnknownResponse({ query: userInput });
        return { content: unknownResponse.response };
    }
  } catch (error) {
    console.error("Error getting AI response:", error);
    // Fallback to a polite unknown response in case of any error
    const fallbackResponse = await generatePoliteUnknownResponse({ query: userInput });
    return { content: fallbackResponse.response };
  }
}
