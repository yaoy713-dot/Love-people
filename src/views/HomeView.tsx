import { useState } from 'react';
import { HeroCard } from '../components/HeroCard';
import { ContactCard } from '../components/ContactCard';
import { PostCallSheet } from './PostCallSheet';
import type { DashboardCard } from '../hooks/useDashboard';
import type { Contact, CallNote } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;

interface Props {
  cards: DashboardCard[];
  inWindow: boolean;
  upcomingNames: string[];
  onBusy: (contactId: string) => void;
  onNoAnswer: (contactId: string) => void;
  onCompleted: (contactId: string, note?: NoteFields) => Promise<void>;
}

export function HomeView({ cards, inWindow, upcomingNames, onBusy, onNoAnswer, onCompleted }: Props) {
  const [sheetContact, setSheetContact] = useState<Contact | null>(null);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[today.getDay()];

  function openSheet(contact: Contact) {
    setSheetContact(contact);
  }

  function closeSheet() {
    setSheetContact(null);
  }

  async function handleSheetCompleted(note?: NoteFields) {
    if (!sheetContact) return;
    closeSheet();
    await onCompleted(sheetContact.id, note);
  }

  function handleSheetNoAnswer() {
    if (!sheetContact) return;
    closeSheet();
    onNoAnswer(sheetContact.id);
  }

  function handleSheetBusy() {
    if (!sheetContact) return;
    closeSheet();
    onBusy(sheetContact.id);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3">
        <div className="text-sm text-stone-400 font-medium">{dayName}</div>
        <h1 className="text-2xl font-bold text-stone-900">Love People</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {!inWindow ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center mt-2">
            <div className="text-3xl mb-3">💼</div>
            <h2 className="font-semibold text-stone-900 mb-1">Focus on work today</h2>
            <p className="text-sm text-stone-500 mb-4">
              Your calling window opens Thursday.
            </p>
            {upcomingNames.length > 0 && (
              <p className="text-sm text-stone-400">
                Lined up: {upcomingNames.join(' · ')}
              </p>
            )}
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center mt-2">
            <div className="text-3xl mb-3">✨</div>
            <h2 className="font-semibold text-stone-900 mb-1">All caught up</h2>
            <p className="text-sm text-stone-500">
              The people in your life heard from you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {cards.map((card, i) =>
              i === 0 ? (
                <HeroCard
                  key={card.contact.id}
                  card={card}
                  onCall={() => openSheet(card.contact)}
                  onBusy={() => onBusy(card.contact.id)}
                />
              ) : (
                <ContactCard
                  key={card.contact.id}
                  card={card}
                  onCall={() => openSheet(card.contact)}
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
          onNoAnswer={handleSheetNoAnswer}
          onBusy={handleSheetBusy}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
