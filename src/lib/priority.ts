import { differenceInDays } from 'date-fns';
import type { Contact, CallLog, ContactStatus, DailyState, Frequency } from '../types';

const PERIOD_DAYS: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 90 };
const NO_ANSWER_THRESHOLD = 3;

export function computeStreak(
  contact: Contact,
  callLogs: CallLog[],
  now: Date = new Date()
): number {
  const periodDays = PERIOD_DAYS[contact.frequency];
  const nowBucket = Math.floor(now.getTime() / (86_400_000 * periodDays));

  const completed = callLogs.filter(
    (l) => l.contactId === contact.id && l.outcome === 'completed'
  );
  if (!completed.length) return 0;

  const buckets = new Set(
    completed.map((l) =>
      Math.floor(new Date(l.date).getTime() / (86_400_000 * periodDays))
    )
  );
  const sorted = [...buckets].sort((a, b) => b - a);

  // Streak is dead if the most-recent call was more than one full period ago.
  // Allow being in a new period but not yet having called (grace window).
  if (sorted[0] < nowBucket - 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] - 1) streak++;
    else break;
  }
  return streak;
}

export function streakLabel(frequency: Frequency, streak: number): string {
  const unit = { weekly: 'week', monthly: 'month', quarterly: 'quarter' }[frequency];
  return `🔥 ${streak} ${unit}${streak !== 1 ? 's' : ''} in a row`;
}

export function computeStatus(
  contact: Contact,
  callLogs: CallLog[],
  now: Date = new Date()
): ContactStatus {
  const periodDays = PERIOD_DAYS[contact.frequency];

  const contactLogs = callLogs.filter((l) => l.contactId === contact.id);
  const completedLogs = contactLogs
    .filter((l) => l.outcome === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date));

  const lastCalledDate = completedLogs[0]?.date ?? null;

  const priorityScore = lastCalledDate
    ? differenceInDays(now, new Date(lastCalledDate)) / periodDays
    : Infinity;

  const sinceDate = lastCalledDate ?? '1970-01-01';
  const noAnswerCount = contactLogs.filter(
    (l) => l.outcome === 'no_answer' && l.date > sinceDate
  ).length;

  return {
    contact,
    priorityScore,
    noAnswerCount,
    showTextPrompt: noAnswerCount >= NO_ANSWER_THRESHOLD,
    lastCalledDate,
    streak: computeStreak(contact, callLogs, now),
  };
}

export function buildContactPool(
  contacts: Contact[],
  callLogs: CallLog[],
  daily: DailyState,
  now: Date = new Date()
): ContactStatus[] {
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();

  const recentlyBusyIds = new Set(
    daily.busyEntries
      .filter((e) => e.busyAt > fourHoursAgo)
      .map((e) => e.contactId)
  );

  const calledIds = new Set(daily.calledIds);

  return contacts
    .filter((c) => !calledIds.has(c.id) && !recentlyBusyIds.has(c.id))
    .map((c) => computeStatus(c, callLogs, now))
    .sort((a, b) => {
      if (a.priorityScore === Infinity && b.priorityScore === Infinity) return 0;
      if (a.priorityScore === Infinity) return -1;
      if (b.priorityScore === Infinity) return 1;
      return b.priorityScore - a.priorityScore;
    });
}
