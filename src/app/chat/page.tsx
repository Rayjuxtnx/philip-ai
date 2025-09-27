'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import type { Message, Conversation } from '@/lib/types';
import { useFirestore, useAuth } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

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

      if (convos.length === 0) {
        // Create a new conversation if none exist
        const newConversationRef = addDoc(conversationsRef, {
          title: 'New Chat',
          createdAt: new Date(),
          messages: [
            {
              id: '1',
              role: 'model',
              content: 'Hello! I am the Philip Virtual Assistant, ready to help.',
              createdAt: new Date().toISOString(),
            },
          ]
        });
        newConversationRef.then(docRef => {
          setActiveConversationId(docRef.id);
        });
      } else {
        setConversations(convos);
        if (!activeConversationId || !convos.some(c => c.id === activeConversationId)) {
          setActiveConversationId(convos[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, [firestore, user, activeConversationId]);


  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  return (
    <main className="h-screen bg-background">
      {activeConversation && firestore && (
        <ChatInterface
          conversation={activeConversation}
        />
      )}
    </main>
  );
}
