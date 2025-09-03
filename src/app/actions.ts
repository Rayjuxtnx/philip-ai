
'use server';

import { converse } from '@/ai/flows/basic-conversation';
import { answerGeneralKnowledgeQuestion } from '@/ai/flows/general-knowledge-qa';
import { generatePoliteUnknownResponse } from '@/ai/flows/polite-unknown-response';
import { selectResponseTool } from '@/ai/flows/response-tool-selection';
import { analyzeImage } from '@/ai/flows/image-analysis';
import { generateImage } from '@/ai/flows/image-generation';

const AVAILABLE_TOOLS = {
  CONVERSE: 'converse',
  QA: 'answerGeneralKnowledgeQuestion',
  ANALYZE_IMAGE: 'analyzeImage',
  GENERATE_IMAGE: 'generateImage',
};

export async function getAiResponse(chatHistory: { role: 'user' | 'model', parts: string }[], newMessage: string, imageUrl?: string): Promise<{content: string, imageUrl?: string}> {
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
        return { content: `Here is the image you asked for.`, imageUrl: imageResponse.imageUrl };

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
