import { useState } from 'react';
import type { Contact, CallNote, Topic } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;
type ClosedTopic = { topic: Topic; note: string };
type Step = 'outcome' | 'topics' | 'journal';

interface Props {
  contact: Contact;
  discussTopics?: Topic[];
  onCompleted: (note?: NoteFields, closedTopics?: ClosedTopic[]) => void;
  onNoAnswer: () => void;
  onBusy: () => void;
  onClose: () => void;
}

export function PostCallSheet({ contact, discussTopics = [], onCompleted, onNoAnswer, onBusy, onClose }: Props) {
  const [step, setStep] = useState<Step>('outcome');
  const [topicNotes, setTopicNotes] = useState<Record<string, string>>({});
  const [memorable, setMemorable] = useState('');
  const [howToHelp, setHowToHelp] = useState('');
  const [howToPray, setHowToPray] = useState('');
  const [followUp, setFollowUp] = useState('');

  const openDiscussTopics = discussTopics.filter((t) => t.status === 'open');

  function handleWeTalked() {
    setStep(openDiscussTopics.length > 0 ? 'topics' : 'journal');
  }

  function handleSave() {
    const hasNote = memorable || howToHelp || howToPray || followUp;
    const closedTopics: ClosedTopic[] = openDiscussTopics.map((t) => ({
      topic: t,
      note: topicNotes[t.id] ?? '',
    }));
    onCompleted(
      hasNote ? { memorable, howToHelp, howToPray, followUp } : undefined,
      closedTopics.length > 0 ? closedTopics : undefined
    );
  }

  function handleJustMarkDone() {
    const closedTopics: ClosedTopic[] = openDiscussTopics.map((t) => ({
      topic: t,
      note: topicNotes[t.id] ?? '',
    }));
    onCompleted(undefined, closedTopics.length > 0 ? closedTopics : undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 sheet-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl shadow-xl sheet-panel max-h-[88vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {step === 'outcome' && (
          <div className="px-5 pb-8 pt-3">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">How did it go with {contact.name}?</h2>
            <p className="text-sm text-stone-500 mb-6">What happened when you called?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleWeTalked} className="bg-stone-900 text-white rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]">
                We talked! 🎉
              </button>
              <button onClick={onNoAnswer} className="bg-stone-100 text-stone-700 rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]">
                No answer
              </button>
              <button onClick={onBusy} className="bg-stone-100 text-stone-700 rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]">
                They were busy
              </button>
            </div>
          </div>
        )}

        {step === 'topics' && (
          <div className="px-5 pb-6 pt-3 overflow-y-auto flex-1">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Close the loop</h2>
            <p className="text-sm text-stone-400 mb-4">You had these topics queued up — what came of them?</p>
            <div className="flex flex-col gap-3 mb-5">
              {openDiscussTopics.map((topic) => (
                <div key={topic.id} className="bg-stone-50 rounded-2xl p-4">
                  <p className="text-sm font-medium text-stone-800 mb-2">💬 {topic.text}</p>
                  <textarea
                    value={topicNotes[topic.id] ?? ''}
                    onChange={(e) => setTopicNotes((prev) => ({ ...prev, [topic.id]: e.target.value }))}
                    placeholder="What came of this? (optional)"
                    rows={2}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none bg-white"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('journal')}
              className="w-full bg-stone-900 text-white rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]"
            >
              Continue to notes →
            </button>
            <button onClick={handleJustMarkDone} className="w-full text-stone-400 text-sm py-3 mt-1">
              Just mark it done
            </button>
          </div>
        )}

        {step === 'journal' && (
          <div className="px-5 pb-6 pt-3 overflow-y-auto flex-1">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Great conversation</h2>
            <p className="text-sm text-stone-400 mb-5">All optional — jot down what stood out.</p>
            <div className="flex flex-col gap-4">
              {[
                { label: 'What was memorable?', value: memorable, set: setMemorable, placeholder: 'What did you talk about? Something funny? Something you learned?' },
                { label: 'How can I help them?', value: howToHelp, set: setHowToHelp, placeholder: 'Something you could do for them...' },
                { label: 'How can I pray for them?', value: howToPray, set: setHowToPray, placeholder: 'What to lift up for them...' },
                { label: 'Follow-up items', value: followUp, set: setFollowUp, placeholder: 'Anything to circle back on...' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
                  <textarea
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={handleSave} className="bg-stone-900 text-white rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]">
                  Save & done
                </button>
                <button onClick={handleJustMarkDone} className="text-stone-400 text-sm py-2">
                  Just mark it done
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="h-[env(safe-area-inset-bottom)] shrink-0" />
      </div>
    </div>
  );
}
