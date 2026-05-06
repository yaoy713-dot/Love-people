import { useState } from 'react';
import { FrequencyBadge } from '../components/FrequencyBadge';
import { initials } from '../lib/relativeTime';
import { PostCallSheet } from './PostCallSheet';
import { format } from 'date-fns';
import type { Contact, CallLog, CallNote } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;

const OUTCOME_LABEL: Record<string, string> = {
  completed: 'Called',
  no_answer: 'No answer',
  busy: 'Busy',
};

const OUTCOME_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  no_answer: 'bg-stone-100 text-stone-500',
  busy: 'bg-amber-100 text-amber-600',
};

interface Props {
  contact: Contact;
  callLogs: CallLog[];
  callNotes: CallNote[];
  onBack: () => void;
  onCompleted: (contactId: string, note?: NoteFields) => Promise<void>;
  onNoAnswer: (contactId: string) => void;
  onBusy: (contactId: string) => void;
}

export function ContactDetailView({
  contact, callLogs, callNotes, onBack, onCompleted, onNoAnswer, onBusy
}: Props) {
  const [showSheet, setShowSheet] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const logs = callLogs
    .filter((l) => l.contactId === contact.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const notesByLogId = new Map(
    callNotes.filter((n) => n.contactId === contact.id).map((n) => [n.callLogId, n])
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="text-stone-500 p-1 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-semibold">
            {initials(contact.name)}
          </div>
          <div>
            <div className="font-semibold text-stone-900">{contact.name}</div>
            <FrequencyBadge frequency={contact.frequency} />
          </div>
        </div>
        <button
          onClick={() => setShowSheet(true)}
          className="bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-xl min-h-[44px] active:scale-95 transition-transform"
        >
          Log call
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {logs.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">No calls logged yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => {
              const note = notesByLogId.get(log.id);
              const isExpanded = expandedNoteId === log.id;
              return (
                <div key={log.id} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLOR[log.outcome]}`}>
                      {OUTCOME_LABEL[log.outcome]}
                    </span>
                    <span className="text-xs text-stone-400">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {note && (
                    <div className="mt-3">
                      {!isExpanded ? (
                        <button
                          onClick={() => setExpandedNoteId(log.id)}
                          className="text-xs text-stone-500 underline underline-offset-2"
                        >
                          View notes
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {note.memorable && (
                            <div>
                              <div className="text-xs font-medium text-stone-500 mb-0.5">Memorable</div>
                              <div className="text-sm text-stone-700">{note.memorable}</div>
                            </div>
                          )}
                          {note.howToHelp && (
                            <div>
                              <div className="text-xs font-medium text-stone-500 mb-0.5">How to help</div>
                              <div className="text-sm text-stone-700">{note.howToHelp}</div>
                            </div>
                          )}
                          {note.howToPray && (
                            <div>
                              <div className="text-xs font-medium text-stone-500 mb-0.5">How to pray</div>
                              <div className="text-sm text-stone-700">{note.howToPray}</div>
                            </div>
                          )}
                          {note.followUp && (
                            <div>
                              <div className="text-xs font-medium text-stone-500 mb-0.5">Follow up</div>
                              <div className="text-sm text-stone-700">{note.followUp}</div>
                            </div>
                          )}
                          <button
                            onClick={() => setExpandedNoteId(null)}
                            className="text-xs text-stone-400 mt-1"
                          >
                            Hide notes
                          </button>
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

      {showSheet && (
        <PostCallSheet
          contact={contact}
          onCompleted={async (note) => {
            setShowSheet(false);
            await onCompleted(contact.id, note);
          }}
          onNoAnswer={() => {
            setShowSheet(false);
            onNoAnswer(contact.id);
          }}
          onBusy={() => {
            setShowSheet(false);
            onBusy(contact.id);
          }}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  );
}
