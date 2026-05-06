import type React from 'react';
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
  const filtered = contacts.filter((c) => (c.profile ?? 'personal') === profile);
  const grouped = ORDER.map((freq) => ({
    freq,
    contacts: filtered.filter((c) => c.frequency === freq),
  }));

  const openTopicCounts = new Map<string, number>();
  topics.filter((t) => t.status === 'open').forEach((t) => {
    openTopicCounts.set(t.contactId, (openTopicCounts.get(t.contactId) ?? 0) + 1);
  });

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
        <h1 className="text-2xl font-bold text-stone-900">People</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {filtered.length === 0 && (
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

        {grouped.map(({ freq, contacts: group }) => {
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
                {group.map((contact) => {
                  const status = computeStatus(contact, callLogs);
                  const topicCount = openTopicCounts.get(contact.id) ?? 0;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => onSelect(contact.id)}
                      className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-3 text-left active:scale-98 transition-transform shadow-sm w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold text-sm shrink-0">
                        {initials(contact.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900">{contact.name}</span>
                          {topicCount > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-600 font-medium px-1.5 py-0.5 rounded-full">
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
