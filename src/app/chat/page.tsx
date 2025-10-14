
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import ChatInterface from '@/components/chat-interface';
import ChatHistory from '@/components/chat-history';
import type { Conversation, Message as MessageType } from '@/lib/types';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader } from '@/components/ui/sidebar';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';

export default function ChatPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const handleNewConversation = useCallback(async () => {
    if (!user || !firestore) return;
    const newConversationData: Omit<Conversation, 'id'> = {
      title: 'New Chat',
      createdAt: new Date(), // Use client-side date for immediate UI update
    };
    const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
    
    // Add to firestore
    const docRef = await addDoc(conversationsRef, {
        title: newConversationData.title,
        createdAt: serverTimestamp() // Use server timestamp for backend
    });

    const newConvo: Conversation = { id: docRef.id, ...newConversationData };

    setConversations(prev => [newConvo, ...prev]);
    setActiveConversationId(docRef.id);
  }, [user, firestore]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
      const q = query(conversationsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const userConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Conversation));

        setConversations(userConversations);
        
        if (snapshot.empty) {
          // If no conversations, create a new one
          await handleNewConversation();
        } else if (!activeConversationId && userConversations.length > 0) {
          // If there's no active conversation set, default to the latest one
          setActiveConversationId(userConversations[0].id);
        }
        setLoadingConversations(false);
      });

      return () => unsubscribe();
    }
  }, [user, firestore, activeConversationId, handleNewConversation]);

  useEffect(() => {
    if (activeConversationId && user && firestore) {
      const messagesRef = collection(firestore, 'users', user.uid, 'conversations', activeConversationId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const convoMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MessageType));
        setMessages(convoMessages);
      });

      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [activeConversationId, user, firestore]);
  
  const handleNewMessage = (message: MessageType) => {
    if (!user || !firestore || !activeConversationId) return;
  
    const messagesRef = collection(firestore, 'users', user.uid, 'conversations', activeConversationId, 'messages');
    
    // We remove the `id` field as Firestore will generate one for us.
    const { id, ...messageData } = message;
    
    addDoc(messagesRef, messageData);
    // UI is updated optimistically via onSnapshot
  };

  const handleTitleUpdate = (conversationId: string, newTitle: string) => {
    if (!user || !firestore) return;
    const convoRef = doc(firestore, 'users', user.uid, 'conversations', conversationId);
    setDoc(convoRef, { title: newTitle }, { merge: true });
    // UI is updated optimistically via onSnapshot
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  if (userLoading || loadingConversations) {
    return (
      <main className="flex items-center justify-center h-screen bg-background">
        <div className="dot-flashing"></div>
      </main>
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
          user={user}
        />
      </Sidebar>
      <SidebarInset className="h-screen bg-background flex flex-col">
        <SidebarHeader className="md:hidden sticky top-0 bg-background/75 backdrop-blur-sm z-10">
          <SidebarTrigger />
        </SidebarHeader>
        <ChatInterface
          key={activeConversation?.id || 'new'}
          conversation={activeConversation}
          messages={messages}
          onNewMessage={handleNewMessage}
          onTitleUpdate={handleTitleUpdate}
          user={user}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
