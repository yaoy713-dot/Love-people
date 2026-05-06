import { lastCalledText, initials } from '../lib/relativeTime';
import { computeStatus } from '../lib/priority';
import type { Contact, CallLog, Frequency } from '../types';

const ORDER: Frequency[] = ['weekly', 'monthly', 'quarterly'];
const LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

interface Props {
  contacts: Contact[];
  callLogs: CallLog[];
  onSelect: (contactId: string) => void;
}

export function ContactsView({ contacts, callLogs, onSelect }: Props) {
  const grouped = ORDER.map((freq) => ({
    freq,
    contacts: contacts.filter((c) => c.frequency === freq),
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-stone-900">People</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {grouped.map(({ freq, contacts: group }) => {
          if (group.length === 0) return null;

          const dueCount = group.filter((c) => {
            const s = computeStatus(c, callLogs);
            return s.priorityScore >= 1;
          }).length;

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
                        <div className="font-medium text-stone-900">{contact.name}</div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {lastCalledText(status.lastCalledDate)}
                          {status.noAnswerCount > 0 && (
                            <span className="ml-2 text-amber-500">
                              {status.noAnswerCount} missed
                            </span>
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
