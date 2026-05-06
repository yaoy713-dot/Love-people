import { useEffect, useState } from 'react';
import { subscribeContacts } from '../firebase/firestore';
import type { Contact } from '../types';

export function useContacts(uid: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) return;
    return subscribeContacts(uid, (loaded) => {
      setContacts(loaded);
      setReady(true);
    });
  }, [uid]);

  return { contacts, ready };
}
