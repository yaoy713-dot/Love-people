import { differenceInDays } from 'date-fns';
import type { Contact, CallLog, ContactStatus, DailyState } from '../types';

const PERIOD_DAYS: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 90 };
const NO_ANSWER_THRESHOLD = 3;

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

export function isCallingWindow(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 0 || day === 4 || day === 5 || day === 6;
}
