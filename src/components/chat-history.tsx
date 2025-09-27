'use client';

import { LogOut, MessageSquare, Plus } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from './ui/sidebar';
import { Button } from './ui/button';
import type { Conversation } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
  const { user, signOut } = useUser();

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
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
      </SidebarHeader>
      <ScrollArea className="flex-1">
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
      </ScrollArea>
      <SidebarSeparator />
      <SidebarFooter>
        {user && (
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{user.displayName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </div>
  );
}
