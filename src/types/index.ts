export type Frequency = 'weekly' | 'monthly' | 'quarterly';
export type CallOutcome = 'completed' | 'no_answer' | 'busy';
export type Profile = 'personal' | 'work';
export type TopicType = 'discuss' | 'text';
export type TopicStatus = 'open' | 'discussed' | 'texted';

export interface Contact {
  id: string;
  name: string;
  frequency: Frequency;
  profile: Profile;
  phone?: string;
  notes?: string;
  birthday?: string; // "MM-DD" e.g. "03-15"
  createdAt: string;
}

export interface Topic {
  id: string;
  contactId: string;
  text: string;
  type: TopicType;
  status: TopicStatus;
  createdAt: string;
  closedAt?: string;
  closingNote?: string;
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

export interface Memo {
  id: string;
  contactId: string;
  text: string;
  createdAt: string;
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
  streak: number;
}

export type ActiveView = 'home' | 'contacts' | 'history';
