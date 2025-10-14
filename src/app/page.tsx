
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, type FirebaseError } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.836,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);


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

  const handleSignIn = async (providerName: 'google' | 'github') => {
    if (!auth || !firestore) return;
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      const userRef = doc(firestore, 'users', loggedInUser.uid);
      await setDoc(userRef, {
        displayName: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code !== 'auth/cancelled-popup-request') {
        console.error('Authentication error:', error);
      }
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
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>Sign in to continue to Philip Virtual Assistant.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button className="w-full" onClick={() => handleSignIn('google')}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleSignIn('github')}>
            <GithubIcon className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
