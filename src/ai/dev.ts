import { config } from 'dotenv';
config();

import '@/ai/flows/basic-conversation.ts';
import '@/ai/flows/general-knowledge-qa.ts';
import '@/ai/flows/response-tool-selection.ts';
import '@/ai/flows/polite-unknown-response.ts';
import '@/ai/flows/image-analysis.ts';
import '@/ai/flows/image-generation.ts';
import '@/ai/flows/code-generation.ts';
