
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Paperclip, SendHorizontal, User, X, Clipboard } from 'lucide-react';
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

import { getAiResponse } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Message, Conversation } from '@/lib/types';


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

const CodeBlock = ({ language, code }: { language: string, code: string }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-white/50 hover:text-white"
        onClick={handleCopy}
      >
        <Clipboard className="h-4 w-4" />
      </Button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          backgroundColor: '#1E1E1E',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};


const renderContent = (message: Message) => {
  if (!message.content) return null;

  if (message.isCode) {
    return (
      <CodeBlock language={message.codeLanguage || 'text'} code={message.content} />
    );
  }

  const contentWithHtml = message.content
    .replace(/\n/g, '<br />')
    .replace(/(\p{Emoji_Presentation}\s*)?<b>(.*?)<\/b>/gu, (match, emoji, text) => {
      const emojiSpan = emoji ? `<span class="mr-2">${emoji.trim()}</span>` : '';
      return `<div class="font-bold text-lg mb-2 flex items-center">${emojiSpan}<strong>${text}</strong></div>`;
    });

  return <div className="prose prose-invert max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: contentWithHtml }} />;
};


interface ChatInterfaceProps {
  conversation: Conversation | null | undefined;
  messages: Message[];
  onNewMessage: (message: Message) => void;
  onTitleUpdate: (conversationId: string, newTitle: string) => void;
  user: FirebaseUser | null;
}

export default function ChatInterface({ conversation, messages, onNewMessage, onTitleUpdate, user }: ChatInterfaceProps) {
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

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            event.preventDefault();
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !image) || isLoading || !conversation) return;
    
    setIsLoading(true);

    const userMessageContent = input;
    const userImage = image;

    setInput('');
    setImage(null);

    const userMessage: Partial<Message> = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: userMessageContent,
        createdAt: serverTimestamp(),
      };
  
    if (userImage) {
      userMessage.imageUrl = userImage;
    }
    
    onNewMessage(userMessage as Message);

    if (conversation.title === 'New Chat' && messages.length === 0) {
        onTitleUpdate(conversation.id, userMessageContent.substring(0, 30))
    }

    try {
      const chatHistoryForAI = [...messages, userMessage as Message].map(m => ({
        role: m.role,
        parts: m.content
      }));

      const response = await getAiResponse(chatHistoryForAI, userMessageContent, userImage || undefined, user?.displayName || undefined);
      
      const botMessage: Partial<Message> = {
        id: `msg-${Date.now()}-bot`,
        role: 'model',
        createdAt: serverTimestamp(),
      };
      
      if (response.content) {
        botMessage.content = response.content;
      }
      
      if (response.isCode) {
        botMessage.isCode = response.isCode;
      }
      if (response.codeLanguage) {
        botMessage.codeLanguage = response.codeLanguage;
      }
      if (response.imageUrl) {
        botMessage.imageUrl = response.imageUrl;
      }

      onNewMessage(botMessage as Message);
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
  
  if (!conversation) {
    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">Select a conversation</h2>
                <p className="text-muted-foreground mt-2">Choose from an existing conversation or start a new one.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-8 max-w-4xl mx-auto w-full">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-10">Start the conversation!</div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-2 md:gap-4 animate-bubble-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                   <Avatar className="w-8 h-8">
                     <AvatarFallback>
                      <HoodieIcon className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'flex-1 space-y-2 max-w-[85%] md:max-w-[75%]',
                     message.role === 'user' ? 'text-right' : 'text-left'
                  )}
                >
                   <p className="font-bold text-sm">
                    {message.role === 'user' ? 'You' : 'Philip Virtual Assistant'}
                  </p>
                  <div className={cn(
                    "prose prose-invert max-w-none text-foreground rounded-lg text-sm md:text-base",
                    'w-full break-words',
                    !message.isCode && 'p-3',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : (message.isCode ? 'bg-transparent p-0' : 'bg-card text-left')
                    )}>
                    {message.imageUrl && (
                      <div className='flex flex-col gap-2'>
                        <Image
                          src={message.imageUrl}
                          alt="User or AI generated content"
                          width={400}
                          height={400}
                          className="rounded-md my-2 max-w-full h-auto"
                        />
                      </div>
                    )}
                    {renderContent(message)}
                  </div>
                  {message.role === 'model' && (
                    <p className="text-xs text-muted-foreground pt-1 text-left">
                      Philip Virtual Assistant can make mistakes. Consider checking important information.
                    </p>
                  )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                     <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-start gap-4 animate-bubble-in">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <HoodieIcon className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2 max-w-[75%] text-left">
                  <p className="font-bold text-sm">Philip Virtual Assistant</p>
                  <div className="inline-block rounded-lg px-4 py-3 text-sm shadow bg-card text-card-foreground">
                    <LoadingDots />
                  </div>
                </div>
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
      </div>
    </div>
  );
}
