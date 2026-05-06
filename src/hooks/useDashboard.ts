import { useState, useCallback, useMemo } from 'react';
import { buildContactPool } from '../lib/priority';
import { getDailyState, markCalled, markBusy } from '../lib/dailyState';
import { addCallLog, addCallNote } from '../firebase/firestore';
import type { Contact, CallLog, CallNote, ContactStatus, DailyState } from '../types';

const ACTIVE_COUNT = 3;

interface DashboardCard extends ContactStatus {
  isExiting: boolean;
}

interface DashboardResult {
  cards: DashboardCard[];
  handleBusy: (contactId: string) => void;
  handleNoAnswer: (contactId: string) => void;
  handleCompleted: (contactId: string, note?: Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>) => Promise<void>;
}

export function useDashboard(
  uid: string,
  contacts: Contact[],
  callLogs: CallLog[]
): DashboardResult {
  const [daily, setDaily] = useState<DailyState>(() => getDailyState());
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const pool = useMemo(
    () => buildContactPool(contacts, callLogs, daily),
    [contacts, callLogs, daily]
  );

  const activeStatuses = pool.slice(0, ACTIVE_COUNT);

  const cards: DashboardCard[] = activeStatuses.map((s) => ({
    ...s,
    isExiting: exitingIds.has(s.contact.id),
  }));

  const replaceCard = useCallback(
    (contactId: string, newDaily: DailyState) => {
      setExitingIds((prev) => new Set([...prev, contactId]));
      setTimeout(() => {
        setExitingIds((prev) => {
          const next = new Set(prev);
          next.delete(contactId);
          return next;
        });
        setDaily(newDaily);
      }, 380);
    },
    []
  );

  const handleBusy = useCallback(
    (contactId: string) => {
      addCallLog(uid, { contactId, date: new Date().toISOString(), outcome: 'busy' });
      const newDaily = markBusy(contactId);
      replaceCard(contactId, newDaily);
    },
    [uid, replaceCard]
  );

  // No-answer hides the contact for the rest of the day (not just 4 hours)
  const handleNoAnswer = useCallback(
    (contactId: string) => {
      addCallLog(uid, { contactId, date: new Date().toISOString(), outcome: 'no_answer' });
      const newDaily = markCalled(contactId);
      replaceCard(contactId, newDaily);
    },
    [uid, replaceCard]
  );

  const handleCompleted = useCallback(
    async (
      contactId: string,
      note?: Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>
    ) => {
      const date = new Date().toISOString();
      const callLogId = await addCallLog(uid, { contactId, date, outcome: 'completed' });
      if (note) {
        await addCallNote(uid, { contactId, callLogId, date, ...note });
      }
      const newDaily = markCalled(contactId);
      replaceCard(contactId, newDaily);
    },
    [uid, replaceCard]
  );

  return { cards, handleBusy, handleNoAnswer, handleCompleted };
}

export type { DashboardCard };
