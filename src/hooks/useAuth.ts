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
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    getRedirectResult(auth).catch(() => {});

    return unsub;
  }, []);

  const signIn = () => signInWithRedirect(auth, new GoogleAuthProvider());
  const signOut = () => firebaseSignOut(auth);

  return { user, loading, signIn, signOut };
}
