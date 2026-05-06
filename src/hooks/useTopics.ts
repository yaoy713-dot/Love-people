import { useEffect, useState } from 'react';
import { subscribeTopics } from '../firebase/firestore';
import type { Topic } from '../types';

export function useTopics(uid: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeTopics(uid, setTopics);
  }, [uid]);

  return topics;
}
