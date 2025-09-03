
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Paperclip, SendHorizontal, User, X, Lock } from 'lucide-react';
import Image from 'next/image';

import { getAiResponse } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/lib/types';


const LoadingDots = () => (
  <div className="flex items-center space-x-2">
    <div className="dot-flashing"></div>
  </div>
);

const HoodieIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2a10 10 0 0 0-9.2 13.34c.26.47.7.75 1.2.75h16c.5 0 .94-.28 1.2-.75A10 10 0 0 0 12 2zm-4.21 12.59.02-1.63c0-.49-.4-.89-.89-.89s-.89.4-.89.89v2.25c0 .55.45 1 1 1h.76v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2h.76c.55 0 1-.45 1-1V12.7c0-.49-.4-.89-.89-.89s-.89.4-.89.89l.02 1.63c-1.31.84-2.87.84-4.18 0z" />
  </svg>
);

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export default function ChatInterface({ messages, setMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !image) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      imageUrl: image || undefined,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map(m => ({
        role: m.role,
        parts: m.content
      }));

      const response = await getAiResponse(chatHistory, userMessage.content, userMessage.imageUrl);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.content,
        imageUrl: response.imageUrl,
        isCode: response.isCode,
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
    <div className="flex flex-col h-full w-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-8 max-w-4xl mx-auto w-full">
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
                     message.role === 'user' ? 'text-left' : 'text-right'
                  )}
                >
                   <p className="font-bold">
                    {message.role === 'user' ? 'You' : 'Philip Virtual Assistant'}
                  </p>
                  <div className={cn("prose prose-invert max-w-none text-foreground rounded-lg p-3 text-left", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card')}>
                    {message.imageUrl && (
                      <div className='flex flex-col gap-2'>
                        <Image
                          src={message.imageUrl}
                          alt="User or AI generated content"
                          width={400}
                          height={400}
                          className="rounded-md my-2"
                        />
                      </div>
                    )}
                    {message.content && (
                      message.isCode ? (
                        <pre className="bg-background text-foreground p-4 rounded-md overflow-x-auto"><code>{message.content}</code></pre>
                      ) : (
                        <p>{message.content}</p>
                      )
                    )}
                  </div>
                  {message.role === 'model' && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Philip Virtual Assistant can make mistakes. Consider checking important information.
                    </p>
                  )}
                </div>
                 {message.role === 'model' && (
                  <Avatar className="w-8 h-8">
                     <AvatarFallback>
                      <HoodieIcon className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end items-start gap-4 animate-bubble-in">
                <div className="flex-1 space-y-2 max-w-[75%] text-right">
                  <p className="font-bold">Philip Virtual Assistant</p>
                  <div className="inline-block rounded-lg px-4 py-3 text-sm shadow bg-card text-card-foreground">
                    <LoadingDots />
                  </div>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <HoodieIcon className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
      </div>
      <div className="p-4 md:p-6 bg-background/75 border-t">
        {image && (
          <div className="relative mb-2 w-32">
            <Image
              src={image}
              alt="Preview"
              width={128}
              height={128}
              className="rounded-md"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/75"
              onClick={() => setImage(null)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex w-full max-w-4xl mx-auto items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach image</span>
          </Button>
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
        <div className='flex items-center justify-center flex-col gap-1 text-xs text-muted-foreground pt-2 max-w-4xl mx-auto'>
            <div className='flex items-center gap-2'>
                <Lock size={12} />
                <span>Your conversation is end-to-end encrypted and no other user can see it.</span>
            </div>
            <span>Signup and Login to track history is coming soon.</span>
        </div>
      </div>
    </div>
  );
}
