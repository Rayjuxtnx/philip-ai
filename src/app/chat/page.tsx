
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';
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

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
      const q = query(conversationsRef, orderBy('createdAt', 'desc'));
      
      getDocs(q).then(snapshot => {
        const userConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Conversation));
        setConversations(userConversations);
        if (userConversations.length > 0) {
          setActiveConversationId(userConversations[0].id);
        } else {
          // If no conversations, create a new one
          handleNewConversation();
        }
        setLoadingConversations(false);
      });
    }
  }, [user, firestore]);

  useEffect(() => {
    if (activeConversationId && user && firestore) {
      const messagesRef = collection(firestore, 'users', user.uid, 'conversations', activeConversationId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      getDocs(q).then(snapshot => {
        const convoMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MessageType));
        setMessages(convoMessages);
      });
    } else {
      setMessages([]);
    }
  }, [activeConversationId, user, firestore]);

  const handleNewConversation = async () => {
    if (!user || !firestore) return;
    const newConversation: Omit<Conversation, 'id'> = {
      title: 'New Chat',
      createdAt: serverTimestamp(),
    };
    const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
    const docRef = await addDoc(conversationsRef, newConversation);
    const newConvo = { id: docRef.id, ...newConversation, createdAt: new Date() } as Conversation;
    setConversations(prev => [newConvo, ...prev]);
    setActiveConversationId(docRef.id);
  };
  
  const handleNewMessage = (message: MessageType) => {
    if (!user || !firestore || !activeConversationId) return;
  
    const messagesRef = collection(firestore, 'users', user.uid, 'conversations', activeConversationId, 'messages');
    
    // We remove the `id` field as Firestore will generate one for us.
    const { id, ...messageData } = message;
    
    addDoc(messagesRef, messageData).then(docRef => {
        // Optimistically update the UI, then update with server data if needed
        setMessages(prev => [...prev, { ...message, id: docRef.id }]);
    });
  };

  const handleTitleUpdate = (conversationId: string, newTitle: string) => {
    if (!user || !firestore) return;
    const convoRef = doc(firestore, 'users', user.uid, 'conversations', conversationId);
    setDoc(convoRef, { title: newTitle }, { merge: true });
    setConversations(convos => convos.map(c => c.id === conversationId ? {...c, title: newTitle} : c));
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
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
