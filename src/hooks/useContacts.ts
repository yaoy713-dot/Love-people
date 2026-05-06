import { useEffect, useState } from 'react';
import { subscribeContacts } from '../firebase/firestore';
import type { Contact } from '../types';

export function useContacts(uid: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeContacts(uid, (loaded) => {
      setContacts(loaded);
      setReady(true);
    });
    // Safety valve: if Firestore hasn't responded in 6s (e.g. IndexedDB blocked
    // in iOS private browsing), mark ready so the user isn't stuck forever.
    const timer = setTimeout(() => setReady(true), 6000);
    return () => { unsub(); clearTimeout(timer); };
  }, [uid]);

  return { contacts, ready };
}
