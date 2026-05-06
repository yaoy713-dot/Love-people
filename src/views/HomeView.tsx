import { useState } from 'react';
import type React from 'react';
import { HeroCard } from '../components/HeroCard';
import { ContactCard } from '../components/ContactCard';
import { PostCallSheet } from './PostCallSheet';
import { getUpcomingBirthdays, birthdayCountdownText } from '../lib/birthday';
import { updateTopic } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import type { DashboardCard } from '../hooks/useDashboard';
import type { Contact, CallNote, Topic } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;
type ClosedTopic = { topic: Topic; note: string };

interface Props {
  cards: DashboardCard[];
  allContacts: Contact[];
  topics: Topic[];
  onBusy: (contactId: string) => void;
  onNoAnswer: (contactId: string) => void;
  onCompleted: (contactId: string, note?: NoteFields) => Promise<void>;
  onSelectContact: (id: string) => void;
  onAddContact: () => void;
  onHelp: () => void;
  profileToggle: React.ReactNode;
}

export function HomeView({ cards, allContacts, topics, onBusy, onNoAnswer, onCompleted, onSelectContact, onAddContact, onHelp, profileToggle }: Props) {
  const { user } = useAuth();
  const [sheetContact, setSheetContact] = useState<Contact | null>(null);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[today.getDay()];
  const upcomingBirthdays = getUpcomingBirthdays(allContacts);
  const hasContacts = allContacts.length > 0;

  const discussTopics = sheetContact
    ? topics.filter((t) => t.contactId === sheetContact.id && t.status === 'open' && t.type === 'discuss')
    : [];

  function closeSheet() { setSheetContact(null); }

  async function handleSheetCompleted(note?: NoteFields, closedTopics?: ClosedTopic[]) {
    if (!sheetContact) return;
    closeSheet();
    if (user && closedTopics?.length) {
      await Promise.all(
        closedTopics.map(({ topic, note: closingNote }) =>
          updateTopic(user.uid, topic.id, {
            status: 'discussed',
            closedAt: new Date().toISOString(),
            closingNote: closingNote || undefined,
          })
        )
      );
    }
    await onCompleted(sheetContact.id, note);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-stone-400 font-medium">{dayName}</div>
          <div className="flex items-center gap-2">
            {profileToggle}
            <button
              onClick={onHelp}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-sm font-medium"
              aria-label="How it works"
            >
              ?
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Love People</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {upcomingBirthdays.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {upcomingBirthdays.map((b) => (
              <button
                key={b.contact.id}
                onClick={() => onSelectContact(b.contact.id)}
                className="bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-left w-full active:scale-95 transition-transform"
              >
                <span className="text-xl">🎂</span>
                <div>
                  <span className="text-sm font-medium text-pink-900">{b.contact.name}'s birthday </span>
                  <span className="text-sm text-pink-600">{birthdayCountdownText(b.daysUntil)}</span>
                  <div className="text-xs text-pink-400 mt-0.5">{b.monthDay}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!hasContacts ? (
          <div className="mt-2 flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center">
              <div className="text-4xl mb-3">🤍</div>
              <h2 className="font-semibold text-stone-900 mb-2">Welcome to Love People</h2>
              <p className="text-sm text-stone-500 leading-relaxed mb-5">
                Add the people you want to stay close to, set how often you want to call them, and the app will tell you who's due each day.
              </p>
              <button
                onClick={onAddContact}
                className="w-full bg-stone-900 text-white rounded-2xl py-3.5 font-medium text-sm active:scale-95 transition-transform"
              >
                Add your first person
              </button>
            </div>
            <button
              onClick={onHelp}
              className="text-sm text-stone-400 text-center py-2 underline underline-offset-2"
            >
              How does it work?
            </button>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center mt-2">
            <div className="text-3xl mb-3">✨</div>
            <h2 className="font-semibold text-stone-900 mb-1">All caught up</h2>
            <p className="text-sm text-stone-500">The people in your life heard from you.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {cards.map((card, i) =>
              i === 0 ? (
                <HeroCard
                  key={card.contact.id}
                  card={card}
                  onCall={() => setSheetContact(card.contact)}
                  onBusy={() => onBusy(card.contact.id)}
                  onSelect={() => onSelectContact(card.contact.id)}
                />
              ) : (
                <ContactCard
                  key={card.contact.id}
                  card={card}
                  onCall={() => setSheetContact(card.contact)}
                  onBusy={() => onBusy(card.contact.id)}
                  onSelect={() => onSelectContact(card.contact.id)}
                />
              )
            )}
          </div>
        )}
      </div>

      {sheetContact && (
        <PostCallSheet
          contact={sheetContact}
          discussTopics={discussTopics}
          onCompleted={handleSheetCompleted}
          onNoAnswer={() => { closeSheet(); onNoAnswer(sheetContact.id); }}
          onBusy={() => { closeSheet(); onBusy(sheetContact.id); }}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
