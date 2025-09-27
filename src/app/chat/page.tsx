
'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import ChatHistory from '@/components/chat-history';
import type { Conversation } from '@/lib/types';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const firestore = useFirestore();
  const { user, isAuthLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (!firestore || !user) return;

    const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
    const q = query(conversationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Conversation));
      
      setConversations(convos);

      if (activeConversationId === null && convos.length > 0) {
        setActiveConversationId(convos[0].id);
      } else if (convos.length === 0 && activeConversationId !== 'new-chat-placeholder') {
        // If there are no convos, we don't auto-create one.
        // We let the ChatInterface handle the creation on first message.
      }
    }, (error) => {
      console.error("Error fetching conversations:", error);
      // Handle error appropriately
    });

    return () => unsubscribe();
  }, [firestore, user, activeConversationId]);

  const handleNewConversation = async () => {
    if (!firestore || !user) return;
    const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
    const newConversation = {
      title: 'New Chat',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(conversationsRef, newConversation);
    const messagesRef = collection(docRef, 'messages');
    await addDoc(messagesRef, {
        role: 'model',
        content: 'Hello! I am the Philip Virtual Assistant, ready to help.',
        createdAt: serverTimestamp(),
    });

    setActiveConversationId(docRef.id);
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  
  if (isAuthLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="dot-flashing"></div>
      </div>
    );
  }

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
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
