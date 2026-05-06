export type Frequency = 'weekly' | 'monthly' | 'quarterly';
export type CallOutcome = 'completed' | 'no_answer' | 'busy';

export interface Contact {
  id: string;
  name: string;
  frequency: Frequency;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface CallLog {
  id: string;
  contactId: string;
  date: string;
  outcome: CallOutcome;
}

export interface CallNote {
  id: string;
  contactId: string;
  callLogId: string;
  date: string;
  memorable: string;
  howToHelp: string;
  howToPray: string;
  followUp: string;
}

export interface BusyEntry {
  contactId: string;
  busyAt: string;
}

export interface DailyState {
  date: string;
  busyEntries: BusyEntry[];
  calledIds: string[];
}

export interface ContactStatus {
  contact: Contact;
  priorityScore: number;
  noAnswerCount: number;
  showTextPrompt: boolean;
  lastCalledDate: string | null;
}

export type ActiveView = 'home' | 'contacts' | 'history';
