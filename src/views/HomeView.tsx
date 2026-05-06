import { useState } from 'react';
import type React from 'react';
import { HeroCard } from '../components/HeroCard';
import { ContactCard } from '../components/ContactCard';
import { PostCallSheet } from './PostCallSheet';
import { getUpcomingBirthdays, birthdayCountdownText } from '../lib/birthday';
import type { DashboardCard } from '../hooks/useDashboard';
import type { Contact, CallNote } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;

interface Props {
  cards: DashboardCard[];
  inWindow: boolean;
  upcomingNames: string[];
  allContacts: Contact[];
  onBusy: (contactId: string) => void;
  onNoAnswer: (contactId: string) => void;
  onCompleted: (contactId: string, note?: NoteFields) => Promise<void>;
  onSelectContact: (id: string) => void;
  profileToggle: React.ReactNode;
}

export function HomeView({ cards, inWindow, upcomingNames, allContacts, onBusy, onNoAnswer, onCompleted, onSelectContact, profileToggle }: Props) {
  const [sheetContact, setSheetContact] = useState<Contact | null>(null);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[today.getDay()];
  const upcomingBirthdays = getUpcomingBirthdays(allContacts);

  function closeSheet() { setSheetContact(null); }

  async function handleSheetCompleted(note?: NoteFields) {
    if (!sheetContact) return;
    closeSheet();
    await onCompleted(sheetContact.id, note);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-stone-400 font-medium">{dayName}</div>
          {profileToggle}
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

        {!inWindow ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center mt-2">
            <div className="text-3xl mb-3">💼</div>
            <h2 className="font-semibold text-stone-900 mb-1">Focus on work today</h2>
            <p className="text-sm text-stone-500 mb-4">Your calling window opens Thursday.</p>
            {upcomingNames.length > 0 && (
              <p className="text-sm text-stone-400">Lined up: {upcomingNames.join(' · ')}</p>
            )}
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
                />
              ) : (
                <ContactCard
                  key={card.contact.id}
                  card={card}
                  onCall={() => setSheetContact(card.contact)}
                  onBusy={() => onBusy(card.contact.id)}
                />
              )
            )}
          </div>
        )}
      </div>

      {sheetContact && (
        <PostCallSheet
          contact={sheetContact}
          onCompleted={handleSheetCompleted}
          onNoAnswer={() => { closeSheet(); onNoAnswer(sheetContact.id); }}
          onBusy={() => { closeSheet(); onBusy(sheetContact.id); }}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
