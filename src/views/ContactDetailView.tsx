import { useState } from 'react';
import { FrequencyBadge } from '../components/FrequencyBadge';
import { initials } from '../lib/relativeTime';
import { PostCallSheet } from './PostCallSheet';
import { format } from 'date-fns';
import { updateContact, addTopic, updateTopic, deleteTopic } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import type { Contact, CallLog, CallNote, Topic } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;

const OUTCOME_LABEL: Record<string, string> = { completed: 'Called', no_answer: 'No answer', busy: 'Busy' };
const OUTCOME_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  no_answer: 'bg-stone-100 text-stone-500',
  busy: 'bg-amber-100 text-amber-600',
};

interface Props {
  contact: Contact;
  callLogs: CallLog[];
  callNotes: CallNote[];
  topics: Topic[];
  onBack: () => void;
  onCompleted: (contactId: string, note?: NoteFields) => Promise<void>;
  onNoAnswer: (contactId: string) => void;
  onBusy: (contactId: string) => void;
}

export function ContactDetailView({
  contact, callLogs, callNotes, topics, onBack, onCompleted, onNoAnswer, onBusy
}: Props) {
  const { user } = useAuth();
  const [showSheet, setShowSheet] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState(contact.birthday ?? '');
  const [newTopicText, setNewTopicText] = useState('');
  const [newTopicType, setNewTopicType] = useState<'discuss' | 'text'>('discuss');
  const [addingTopic, setAddingTopic] = useState(false);

  const openTopics = topics.filter((t) => t.contactId === contact.id && t.status === 'open');

  const logs = callLogs
    .filter((l) => l.contactId === contact.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const notesByLogId = new Map(
    callNotes.filter((n) => n.contactId === contact.id).map((n) => [n.callLogId, n])
  );

  async function saveBirthday() {
    if (!user) return;
    await updateContact(user.uid, contact.id, { birthday: birthdayInput.trim() || undefined });
    setEditingBirthday(false);
  }

  async function handleAddTopic() {
    if (!user || !newTopicText.trim()) return;
    await addTopic(user.uid, {
      contactId: contact.id,
      text: newTopicText.trim(),
      type: newTopicType,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    setNewTopicText('');
    setAddingTopic(false);
  }

  async function closeTopic(topic: Topic, status: 'discussed' | 'texted') {
    if (!user) return;
    await updateTopic(user.uid, topic.id, { status, closedAt: new Date().toISOString() });
  }

  async function handleDeleteTopic(topicId: string) {
    if (!user) return;
    await deleteTopic(user.uid, topicId);
  }

  function formatBirthday(mmdd: string) {
    const [mm, dd] = mmdd.split('-').map(Number);
    return new Date(2000, mm - 1, dd).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-stone-500 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
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

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">

        {/* Topics */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-800">Topics to discuss</span>
            <button
              onClick={() => setAddingTopic(true)}
              className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full min-h-[32px]"
            >
              + Add
            </button>
          </div>

          {addingTopic && (
            <div className="px-4 pb-3 border-t border-stone-50 pt-3">
              <textarea
                autoFocus
                value={newTopicText}
                onChange={(e) => setNewTopicText(e.target.value)}
                placeholder="What do you want to discuss or text them?"
                rows={2}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setNewTopicType('discuss')}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors ${
                    newTopicType === 'discuss' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600'
                  }`}
                >
                  💬 Discuss on call
                </button>
                <button
                  onClick={() => setNewTopicType('text')}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors ${
                    newTopicType === 'text' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600'
                  }`}
                >
                  💬 Send as text
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopicText.trim()}
                  className="flex-1 bg-stone-900 text-white text-sm py-2 rounded-xl disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={() => { setAddingTopic(false); setNewTopicText(''); }}
                  className="text-stone-400 text-sm px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {openTopics.length === 0 && !addingTopic ? (
            <p className="px-4 pb-4 text-sm text-stone-400">Nothing queued up yet.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {openTopics.map((topic) => (
                <div key={topic.id} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-base mt-0.5">{topic.type === 'text' ? '📱' : '💬'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800">{topic.text}</p>
                    {topic.type === 'text' && (
                      <span className="text-xs text-blue-500 font-medium">Text them this</span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => closeTopic(topic, topic.type === 'text' ? 'texted' : 'discussed')}
                      className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-lg min-h-[32px]"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="text-xs text-stone-300 px-2 py-1 min-h-[32px]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Birthday */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🎂</span>
          <div className="flex-1">
            {editingBirthday ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={birthdayInput}
                  onChange={(e) => setBirthdayInput(e.target.value)}
                  placeholder="MM-DD  e.g. 03-15"
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
                <button onClick={saveBirthday} className="text-sm font-medium text-stone-900 min-h-[44px] px-2">Save</button>
                <button onClick={() => setEditingBirthday(false)} className="text-sm text-stone-400 min-h-[44px] px-2">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-stone-700">Birthday</div>
                  <div className="text-xs text-stone-400">
                    {contact.birthday ? formatBirthday(contact.birthday) : 'Not set'}
                  </div>
                </div>
                <button
                  onClick={() => { setBirthdayInput(contact.birthday ?? ''); setEditingBirthday(true); }}
                  className="text-xs text-stone-400 underline underline-offset-2 min-h-[44px] flex items-center"
                >
                  {contact.birthday ? 'Edit' : 'Add'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Call log */}
        <div>
          <div className="text-sm font-semibold text-stone-700 mb-2 px-1">Call history</div>
          {logs.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No calls logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => {
                const note = notesByLogId.get(log.id);
                const isExpanded = expandedNoteId === log.id;
                return (
                  <div key={log.id} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLOR[log.outcome]}`}>
                        {OUTCOME_LABEL[log.outcome]}
                      </span>
                      <span className="text-xs text-stone-400">{format(new Date(log.date), 'MMM d, yyyy')}</span>
                    </div>
                    {note && (
                      <div className="mt-3">
                        {!isExpanded ? (
                          <button onClick={() => setExpandedNoteId(log.id)} className="text-xs text-stone-500 underline underline-offset-2">View notes</button>
                        ) : (
                          <div className="space-y-2">
                            {note.memorable && <div><div className="text-xs font-medium text-stone-500 mb-0.5">Memorable</div><div className="text-sm text-stone-700">{note.memorable}</div></div>}
                            {note.howToHelp && <div><div className="text-xs font-medium text-stone-500 mb-0.5">How to help</div><div className="text-sm text-stone-700">{note.howToHelp}</div></div>}
                            {note.howToPray && <div><div className="text-xs font-medium text-stone-500 mb-0.5">How to pray</div><div className="text-sm text-stone-700">{note.howToPray}</div></div>}
                            {note.followUp && <div><div className="text-xs font-medium text-stone-500 mb-0.5">Follow up</div><div className="text-sm text-stone-700">{note.followUp}</div></div>}
                            <button onClick={() => setExpandedNoteId(null)} className="text-xs text-stone-400 mt-1">Hide</button>
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

      {showSheet && (
        <PostCallSheet
          contact={contact}
          discussTopics={openTopics.filter((t) => t.type === 'discuss')}
          onCompleted={async (note, closedTopics) => {
            setShowSheet(false);
            if (user && closedTopics) {
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
            await onCompleted(contact.id, note);
          }}
          onNoAnswer={() => { setShowSheet(false); onNoAnswer(contact.id); }}
          onBusy={() => { setShowSheet(false); onBusy(contact.id); }}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  );
}
