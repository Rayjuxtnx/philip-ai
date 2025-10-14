
'use client';

import { LogOut, MessageSquare, Plus } from 'lucide-react';
import type { User } from 'firebase/auth';

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
import { useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ChatHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  onNewConversation: () => void;
  user: User | null;
}

export default function ChatHistory({
  conversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
  user,
}: ChatHistoryProps) {
  const auth = useAuth();

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
      {user && auth && (
        <>
          <SidebarSeparator />
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <p className="flex-1 truncate font-medium text-sm text-sidebar-primary-foreground/80">{user.displayName || 'User'}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-primary-foreground/80 hover:text-sidebar-primary-foreground" onClick={() => auth.signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </>
      )}
    </div>
  );
}
