import type React from 'react';
import { useState } from 'react';
import { lastCalledText, initials } from '../lib/relativeTime';
import { computeStatus } from '../lib/priority';
import type { Contact, CallLog, Topic, Frequency, Profile } from '../types';

const ORDER: Frequency[] = ['weekly', 'monthly', 'quarterly'];
const LABELS: Record<Frequency, string> = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly' };

interface Props {
  contacts: Contact[];
  callLogs: CallLog[];
  topics: Topic[];
  profile: Profile;
  onSelect: (contactId: string) => void;
  onAdd: () => void;
  profileToggle: React.ReactNode;
}

export function ContactsView({ contacts, callLogs, topics, profile, onSelect, onAdd, profileToggle }: Props) {
  const [search, setSearch] = useState('');

  const openTopicCounts = new Map<string, number>();
  topics.filter((t) => t.status === 'open').forEach((t) => {
    openTopicCounts.set(t.contactId, (openTopicCounts.get(t.contactId) ?? 0) + 1);
  });

  const profileContacts = contacts.filter((c) => (c.profile ?? 'personal') === profile);
  const filtered = search.trim()
    ? profileContacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : profileContacts;

  const grouped = ORDER.map((freq) => ({
    freq,
    contacts: filtered.filter((c) => c.frequency === freq),
  }));

  const showGroups = !search.trim();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-3">
          {profileToggle}
          <button
            onClick={onAdd}
            className="bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-xl min-h-[44px] active:scale-95 transition-transform"
          >
            + Add
          </button>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">People</h1>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-stone-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {profileContacts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">{profile === 'work' ? '💼' : '🤍'}</div>
            <p className="text-stone-500 text-sm mb-4">
              {profile === 'work' ? 'No coworkers added yet.' : 'No contacts yet.'}
            </p>
            <button onClick={onAdd} className="text-sm font-medium text-stone-700 underline underline-offset-2">
              Add someone
            </button>
          </div>
        )}

        {search.trim() && filtered.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-8">No results for "{search}"</p>
        )}

        {showGroups ? (
          grouped.map(({ freq, contacts: group }) => {
            if (group.length === 0) return null;
            const dueCount = group.filter((c) => computeStatus(c, callLogs).priorityScore >= 1).length;
            return (
              <div key={freq} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-stone-700">{LABELS[freq]}</span>
                  {dueCount > 0 && (
                    <span className="text-xs bg-[#fef2f0] text-[#f97066] font-medium px-2 py-0.5 rounded-full">
                      {dueCount} due
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {group.map((contact) => (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      callLogs={callLogs}
                      topicCount={openTopicCounts.get(contact.id) ?? 0}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {filtered.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                callLogs={callLogs}
                topicCount={openTopicCounts.get(contact.id) ?? 0}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactRow({ contact, callLogs, topicCount, onSelect }: {
  contact: Contact;
  callLogs: CallLog[];
  topicCount: number;
  onSelect: (id: string) => void;
}) {
  const status = computeStatus(contact, callLogs);
  return (
    <button
      onClick={() => onSelect(contact.id)}
      className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-3 text-left active:scale-98 transition-transform shadow-sm w-full"
    >
      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold text-sm shrink-0">
        {initials(contact.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900 truncate">{contact.name}</span>
          {topicCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 font-medium px-1.5 py-0.5 rounded-full shrink-0">
              {topicCount} topic{topicCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="text-xs text-stone-400 mt-0.5">
          {lastCalledText(status.lastCalledDate)}
          {status.noAnswerCount > 0 && (
            <span className="ml-2 text-amber-500">{status.noAnswerCount} missed</span>
          )}
        </div>
      </div>
      {status.priorityScore >= 1 && (
        <div className="w-2 h-2 rounded-full bg-[#f97066] shrink-0" />
      )}
    </button>
  );
}
