'use client';

import { MessageSquare, Plus } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarGroupContent,
} from './ui/sidebar';
import { Button } from './ui/button';

export default function ChatHistory() {
  const historyItems = [
    'First conversation topic',
    'A question about React',
    'Tailwind CSS tips',
    'Next.js routing query',
    'ShadCN component styling',
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <Button variant="outline" className="w-full justify-between">
          New Chat
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarGroupContent>
              {historyItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton className="truncate">
                    <MessageSquare />
                    {item}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarMenu>
      </div>
    </div>
  );
}
