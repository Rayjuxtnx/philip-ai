
'use client';

import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export default function Home() {
  const { user, signInWithGithub, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/chat');
    }
  }, [user, router]);

  if (isAuthLoading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <div className="dot-flashing"></div>
      </main>
    );
  }

  if (user) {
    return null; 
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Philip Virtual Assistant</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <Button onClick={signInWithGithub}>
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>
      </div>
    </main>
  );
}
