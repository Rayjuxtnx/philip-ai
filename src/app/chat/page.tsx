
'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import ChatHistory from '@/components/chat-history';
import type { Conversation } from '@/lib/types';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader } from '@/components/ui/sidebar';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `convo-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date(),
    };
    const newConversations = [newConversation, ...conversations];
    setConversations(newConversations);
    setActiveConversationId(newConversation.id);
  };

  useEffect(() => {
    if (conversations.length === 0) {
      handleNewConversation();
    }
  }, []);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <ChatHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          onNewConversation={handleNewConversation}
        />
      </Sidebar>
      <SidebarInset className="h-screen bg-background flex flex-col">
        <SidebarHeader className="md:hidden sticky top-0 bg-background/75 backdrop-blur-sm z-10">
          <SidebarTrigger />
        </SidebarHeader>
        <ChatInterface
          key={activeConversation?.id || 'new'}
          conversation={activeConversation}
          onNewConversation={handleNewConversation}
          onTitleUpdate={(conversationId, newTitle) => {
            setConversations(convos => convos.map(c => c.id === conversationId ? {...c, title: newTitle} : c));
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
