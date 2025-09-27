// src/firebase/index.ts
export { initializeFirebase } from './init';
export { FirebaseClientProvider } from './client-provider';
export {
  FirebaseProvider,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';
export { useUser } from './auth/use-user';
