
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Bot, SendHorizontal, User } from 'lucide-react';

import { getAiResponse } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/app/page';


const LoadingDots = () => (
  <div className="flex items-center space-x-2">
    <div className="dot-flashing"></div>
  </div>
);

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export default function ChatInterface({ messages, setMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map(m => ({
        role: m.role,
        parts: m.content
      }));

      const response = await getAiResponse(chatHistory, userMessage.content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
      };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem communicating with the AI. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-8 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-4 animate-bubble-in',
                  message.role === 'user' ? 'justify-start' : 'justify-end'
                )}
              >
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                     <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'flex-1 space-y-2 max-w-[75%]',
                     message.role === 'model' ? 'text-right' : 'text-left'
                  )}
                >
                   <p className="font-bold">
                    {message.role === 'user' ? 'You' : 'Chatty Companion'}
                  </p>
                  <div className={cn("prose prose-invert max-w-none text-foreground rounded-lg p-3 text-left", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card')}>
                    {message.content}
                  </div>
                </div>
                 {message.role === 'model' && (
                  <Avatar className="w-8 h-8">
                     <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end items-start gap-4 animate-bubble-in">
                <div className="flex-1 space-y-2 max-w-[75%] text-right">
                  <p className="font-bold">Chatty Companion</p>
                  <div className="inline-block rounded-lg px-4 py-3 text-sm shadow bg-card text-card-foreground">
                    <LoadingDots />
                  </div>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
      </div>
      <div className="p-4 md:p-6 bg-background/75 border-t">
        <form onSubmit={handleSubmit} className="flex w-full max-w-4xl mx-auto items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-muted border-0 ring-offset-0 focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading} className="bg-accent hover:bg-accent/90">
            <SendHorizontal className="h-4 w-4 text-accent-foreground" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
