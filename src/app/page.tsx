
'use client';

import { Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';

export default function Home() {
  const { data: user, isLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/chat');
    }
  }, [user, isLoading, router]);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      const loggedInUser = result.user;
      const userRef = doc(firestore, 'users', loggedInUser.uid);
      await setDoc(userRef, {
        displayName: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  if (isLoading || (!isLoading && user)) {
    return (
      <main className="flex items-center justify-center h-screen bg-background">
        <div className="dot-flashing"></div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to Philip Virtual Assistant.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleSignIn}>
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
