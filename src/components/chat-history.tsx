
'use client';

import { MessageSquare, Plus } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { Button } from './ui/button';
import type { Conversation } from '@/lib/types';

interface ChatHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  onNewConversation: () => void;
}

export default function ChatHistory({
  conversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
}: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={onNewConversation}
        >
          New Chat
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu>
          {conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id}>
              <SidebarMenuButton
                className="truncate"
                isActive={conversation.id === activeConversationId}
                onClick={() => setActiveConversationId(conversation.id)}
              >
                <MessageSquare />
                {conversation.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </div>
  );
}
