import { useEffect, useState } from 'react';
import { subscribeMemos } from '../firebase/firestore';
import type { Memo } from '../types';

export function useMemos(uid: string | null) {
  const [memos, setMemos] = useState<Memo[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeMemos(uid, setMemos);
  }, [uid]);

  return memos;
}
