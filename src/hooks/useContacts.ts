import { useEffect, useState } from 'react';
import { subscribeContacts, seedContacts } from '../firebase/firestore';
import { DEFAULT_CONTACTS } from '../data/contacts';
import type { Contact } from '../types';

const SEEDED_PREFIX = 'love-people-seeded-';

export function useContacts(uid: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const unsub = subscribeContacts(uid, async (loaded) => {
      const seededKey = `${SEEDED_PREFIX}${uid}`;
      if (loaded.length === 0 && !localStorage.getItem(seededKey)) {
        localStorage.setItem(seededKey, '1');
        await seedContacts(uid, DEFAULT_CONTACTS);
      } else {
        setContacts(loaded);
        setReady(true);
      }
    });

    return unsub;
  }, [uid]);

  return { contacts, ready };
}
