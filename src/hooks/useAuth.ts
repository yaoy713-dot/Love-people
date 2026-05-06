import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process any pending redirect sign-in result before subscribing to auth state.
    // If there's no pending redirect, this resolves to null harmlessly.
    getRedirectResult(auth).catch(() => {});

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = () => signInWithRedirect(auth, new GoogleAuthProvider());

  const signOut = () => firebaseSignOut(auth);

  return { user, loading, signIn, signOut };
}
