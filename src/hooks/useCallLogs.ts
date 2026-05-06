import { useEffect, useState } from 'react';
import { subscribeCallLogs, subscribeCallNotes } from '../firebase/firestore';
import type { CallLog, CallNote } from '../types';

export function useCallLogs(uid: string | null) {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callNotes, setCallNotes] = useState<CallNote[]>([]);

  useEffect(() => {
    if (!uid) return;
    const unsubLogs = subscribeCallLogs(uid, setCallLogs);
    const unsubNotes = subscribeCallNotes(uid, setCallNotes);
    return () => { unsubLogs(); unsubNotes(); };
  }, [uid]);

  return { callLogs, callNotes };
}
