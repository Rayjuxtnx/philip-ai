
'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat-interface';
import type { Message, Conversation } from '@/lib/types';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'First conversation',
      messages: [
        {
          id: '1',
          role: 'model',
          content: 'Hello! I am Philip Virtual Assistant. How can I help you today?',
        },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('1');

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const setMessages = (messages: Message[]) => {
    if (!activeConversationId) return;

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              messages,
              title:
                c.title === 'New Chat' && messages.length > 1
                  ? messages[1].content.substring(0, 30)
                  : c.title,
            }
          : c
      )
    );
  };

  return (
    <main className="flex h-screen flex-col items-center bg-background">
      <div className="flex-1 w-full overflow-y-auto">
        {activeConversation && (
          <ChatInterface
            messages={activeConversation.messages}
            setMessages={setMessages}
          />
        )}
      </div>
    </main>
  );
}
