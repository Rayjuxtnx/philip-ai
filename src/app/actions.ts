
'use server';

import { converse } from '@/ai/flows/basic-conversation';
import { answerGeneralKnowledgeQuestion } from '@/ai/flows/general-knowledge-qa';
import { generatePoliteUnknownResponse } from '@/ai/flows/polite-unknown-response';
import { selectResponseTool } from '@/ai/flows/response-tool-selection';
import { analyzeImage } from '@/ai/flows/image-analysis';

const AVAILABLE_TOOLS = {
  CONVERSE: 'converse',
  QA: 'answerGeneralKnowledgeQuestion',
  ANALYZE_IMAGE: 'analyzeImage',
};

export async function getAiResponse(chatHistory: { role: 'user' | 'model', parts: string }[], newMessage: string, imageUrl?: string): Promise<string> {
  const userInput = newMessage;
  try {
    if (imageUrl) {
      const response = await analyzeImage({ image: imageUrl, question: userInput });
      return response.analysis;
    }

    const { selectedTool } = await selectResponseTool({
      userInput,
      availableTools: Object.values(AVAILABLE_TOOLS),
    });

    const conversationHistory = chatHistory.slice(0, -1);

    switch (selectedTool) {
      case AVAILABLE_TOOLS.CONVERSE:
        const conversationResponse = await converse({ userInput, chatHistory: conversationHistory });
        return conversationResponse.response;

      case AVAILABLE_TOOLS.QA:
        const qaResponse = await answerGeneralKnowledgeQuestion({ question: userInput, chatHistory: conversationHistory });
        return qaResponse.answer;

      default:
        const unknownResponse = await generatePoliteUnknownResponse({ query: userInput });
        return unknownResponse.response;
    }
  } catch (error) {
    console.error("Error getting AI response:", error);
    // Fallback to a polite unknown response in case of any error
    const fallbackResponse = await generatePoliteUnknownResponse({ query: userInput });
    return fallbackResponse.response;
  }
}
