
'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import ChatHistory from '@/components/chat-history';
import type { Conversation } from '@/lib/types';
import { useFirestore, useAuth } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader } from '@/components/ui/sidebar';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const firestore = useFirestore();
  const { user } = useAuth();

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
      } else if (activeConversationId === null && convos.length === 0) {
        handleNewConversation();
      }
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
