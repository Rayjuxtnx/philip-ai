import { config } from 'dotenv';
config();

import '@/ai/flows/basic-conversation.ts';
import '@/ai/flows/general-knowledge-qa.ts';
import '@/ai/flows/response-tool-selection.ts';
import '@/ai/flows/polite-unknown-response.ts';