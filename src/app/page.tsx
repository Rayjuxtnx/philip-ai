
'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat-interface';
import ChatHistory from '@/components/chat-history';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
};

export type Conversation = {
  id:string;
  title: string;
  messages: Message[];
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'First conversation',
      messages: [
        {
          id: '1',
          role: 'model',
          content: 'Hello! I am Chatty Companion. How can I help you today?',
        },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('1');

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          id: '1',
          role: 'model',
          content: 'Hello! I am Chatty Companion. How can I help you today? 🤖',
        },
      ],
    };
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
  };

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
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <ChatHistory
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            onNewConversation={handleNewConversation}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
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
      </SidebarInset>
    </>
  );
}
