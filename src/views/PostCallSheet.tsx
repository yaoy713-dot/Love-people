import { useState } from 'react';
import type { Contact, CallNote } from '../types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;
type Step = 'outcome' | 'journal';

interface Props {
  contact: Contact;
  onCompleted: (note?: NoteFields) => void;
  onNoAnswer: () => void;
  onBusy: () => void;
  onClose: () => void;
}

export function PostCallSheet({ contact, onCompleted, onNoAnswer, onBusy, onClose }: Props) {
  const [step, setStep] = useState<Step>('outcome');
  const [memorable, setMemorable] = useState('');
  const [howToHelp, setHowToHelp] = useState('');
  const [howToPray, setHowToPray] = useState('');
  const [followUp, setFollowUp] = useState('');

  function handleSave() {
    const hasContent = memorable || howToHelp || howToPray || followUp;
    onCompleted(hasContent ? { memorable, howToHelp, howToPray, followUp } : undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 sheet-backdrop"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl shadow-xl sheet-panel max-h-[85vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {step === 'outcome' ? (
          <div className="px-5 pb-8 pt-3">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">
              How did it go with {contact.name}?
            </h2>
            <p className="text-sm text-stone-500 mb-6">What happened when you called?</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('journal')}
                className="bg-stone-900 text-white rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]"
              >
                We talked! 🎉
              </button>
              <button
                onClick={onNoAnswer}
                className="bg-stone-100 text-stone-700 rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]"
              >
                No answer
              </button>
              <button
                onClick={onBusy}
                className="bg-stone-100 text-stone-700 rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]"
              >
                They were busy
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-6 pt-3 overflow-y-auto flex-1">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">
              Great conversation with {contact.name}
            </h2>
            <p className="text-sm text-stone-400 mb-5">All optional — jot down what stood out.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  What was memorable?
                </label>
                <textarea
                  value={memorable}
                  onChange={(e) => setMemorable(e.target.value)}
                  placeholder="What did you talk about? Something funny? Something you learned?"
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  How can I help them?
                </label>
                <textarea
                  value={howToHelp}
                  onChange={(e) => setHowToHelp(e.target.value)}
                  placeholder="Something you could do for them..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  How can I pray for them?
                </label>
                <textarea
                  value={howToPray}
                  onChange={(e) => setHowToPray(e.target.value)}
                  placeholder="What to lift up for them..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Follow-up items
                </label>
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Anything to circle back on..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="bg-stone-900 text-white rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform min-h-[56px]"
                >
                  Save & done
                </button>
                <button
                  onClick={() => onCompleted(undefined)}
                  className="text-stone-400 text-sm py-2"
                >
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
