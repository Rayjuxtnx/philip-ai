// src/firebase/client-provider.tsx
'use client';
import { initializeFirebase } from '@/firebase/init';
import { FirebaseProvider } from '@/firebase/provider';
import React, { ReactNode } from 'react';

type Props = { children: ReactNode };

// It's a good practice to memoize the initialization
const firebaseApp = initializeFirebase();

export function FirebaseClientProvider({ children }: Props) {
  return <FirebaseProvider {...firebaseApp}>{children}</FirebaseProvider>;
}
