import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    if (isMobile) {
      getRedirectResult(auth).catch(() => {});
    }

    return unsub;
  }, []);

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    if (isMobile) {
      return signInWithRedirect(auth, provider);
    }
    return signInWithPopup(auth, provider);
  };

  const signOut = () => firebaseSignOut(auth);

  return { user, loading, signIn, signOut };
}
