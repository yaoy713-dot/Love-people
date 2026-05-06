import { useState } from 'react';
import { format } from 'date-fns';
import { initials } from '../lib/relativeTime';
import type { Contact, CallLog, CallNote } from '../types';

const OUTCOME_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  no_answer: 'bg-stone-100 text-stone-500',
  busy: 'bg-amber-100 text-amber-600',
};

const OUTCOME_LABEL: Record<string, string> = {
  completed: 'Talked',
  no_answer: 'No answer',
  busy: 'Busy',
};

interface Props {
  callLogs: CallLog[];
  callNotes: CallNote[];
  contacts: Contact[];
}

export function HistoryView({ callLogs, callNotes, contacts }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const notesByLogId = new Map(callNotes.map((n) => [n.callLogId, n]));

  const sorted = [...callLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-stone-900">History</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">📞</div>
            <p className="text-stone-400 text-sm">No calls logged yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((log) => {
              const contact = contactMap.get(log.contactId);
              const note = notesByLogId.get(log.id);
              const isExpanded = expandedId === log.id;
              if (!contact) return null;

              return (
                <div key={log.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold text-xs shrink-0">
                      {initials(contact.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-900 text-sm">{contact.name}</div>
                      <div className="text-xs text-stone-400">
                        {format(new Date(log.date), 'EEE, MMM d')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLOR[log.outcome]}`}>
                        {OUTCOME_LABEL[log.outcome]}
                      </span>
                      {note && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="text-xs text-stone-400 min-h-[44px] flex items-center"
                        >
                          {isExpanded ? 'Hide' : 'Notes'}
                        </button>
                      )}
                    </div>
                  </div>

                  {note && isExpanded && (
                    <div className="mt-3 pl-12 space-y-2">
                      {note.memorable && (
                        <div>
                          <div className="text-xs font-medium text-stone-400 mb-0.5">Memorable</div>
                          <div className="text-sm text-stone-700">{note.memorable}</div>
                        </div>
                      )}
                      {note.howToHelp && (
                        <div>
                          <div className="text-xs font-medium text-stone-400 mb-0.5">Help</div>
                          <div className="text-sm text-stone-700">{note.howToHelp}</div>
                        </div>
                      )}
                      {note.howToPray && (
                        <div>
                          <div className="text-xs font-medium text-stone-400 mb-0.5">Prayer</div>
                          <div className="text-sm text-stone-700">{note.howToPray}</div>
                        </div>
                      )}
                      {note.followUp && (
                        <div>
                          <div className="text-xs font-medium text-stone-400 mb-0.5">Follow up</div>
                          <div className="text-sm text-stone-700">{note.followUp}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
