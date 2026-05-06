import type { DailyState, BusyEntry } from '../types';

const STORAGE_KEY = 'love-people-daily';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): DailyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyState;
      if (parsed.date === todayStr()) return parsed;
    }
  } catch {}
  return { date: todayStr(), busyEntries: [], calledIds: [] };
}

function save(state: DailyState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDailyState(): DailyState {
  return load();
}

export function markCalled(contactId: string): DailyState {
  const state = load();
  if (!state.calledIds.includes(contactId)) {
    state.calledIds = [...state.calledIds, contactId];
    save(state);
  }
  return state;
}

export function markBusy(contactId: string): DailyState {
  const state = load();
  state.busyEntries = [
    ...state.busyEntries.filter((e) => e.contactId !== contactId),
    { contactId, busyAt: new Date().toISOString() } satisfies BusyEntry,
  ];
  save(state);
  return state;
}

export function undoBusy(contactId: string): DailyState {
  const state = load();
  state.busyEntries = state.busyEntries.filter((e) => e.contactId !== contactId);
  save(state);
  return state;
}
