import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Contact, CallLog, CallNote } from '../types';

const contactsCol = (uid: string) => collection(db, 'users', uid, 'contacts');
const callLogsCol = (uid: string) => collection(db, 'users', uid, 'callLogs');
const callNotesCol = (uid: string) => collection(db, 'users', uid, 'callNotes');

export function subscribeContacts(uid: string, cb: (contacts: Contact[]) => void): Unsubscribe {
  return onSnapshot(contactsCol(uid), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact)));
  });
}

export function subscribeCallLogs(uid: string, cb: (logs: CallLog[]) => void): Unsubscribe {
  const q = query(callLogsCol(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CallLog)));
  });
}

export function subscribeCallNotes(uid: string, cb: (notes: CallNote[]) => void): Unsubscribe {
  const q = query(callNotesCol(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CallNote)));
  });
}

export async function seedContacts(uid: string, contacts: Contact[]): Promise<void> {
  await Promise.all(
    contacts.map(({ id, ...data }) =>
      setDoc(doc(contactsCol(uid), id), data)
    )
  );
}

export async function addCallLog(uid: string, log: Omit<CallLog, 'id'>): Promise<string> {
  const ref = await addDoc(callLogsCol(uid), log);
  return ref.id;
}

export async function addCallNote(uid: string, note: Omit<CallNote, 'id'>): Promise<void> {
  await addDoc(callNotesCol(uid), note);
}

export async function updateContact(uid: string, contactId: string, patch: Partial<Contact>): Promise<void> {
  const { id: _id, ...data } = patch as Contact;
  await updateDoc(doc(contactsCol(uid), contactId), data);
}
