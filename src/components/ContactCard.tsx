import { FrequencyBadge } from './FrequencyBadge';
import { lastCalledText, initials } from '../lib/relativeTime';
import type { DashboardCard } from '../hooks/useDashboard';

interface Props {
  card: DashboardCard;
  onCall: () => void;
  onBusy: () => void;
}

export function ContactCard({ card, onCall, onBusy }: Props) {
  const { contact, showTextPrompt, lastCalledDate, isExiting } = card;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-stone-100 p-4 transition-all duration-350 ${
        isExiting ? 'slide-out' : 'slide-in'
      }`}
    >
      {showTextPrompt && (
        <div className="text-xs text-amber-600 font-medium mb-2">
          3 tries — consider texting to schedule
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold text-sm shrink-0">
          {initials(contact.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-stone-800">{contact.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <FrequencyBadge frequency={contact.frequency} />
            <span className="text-xs text-stone-400">{lastCalledText(lastCalledDate)}</span>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={onCall}
            className="bg-stone-900 text-white rounded-xl px-4 py-2 text-sm font-medium active:scale-95 transition-transform min-h-[44px]"
          >
            Call
          </button>
          <button
            onClick={onBusy}
            className="bg-stone-100 text-stone-500 rounded-xl px-3 py-2 text-sm active:scale-95 transition-transform min-h-[44px]"
          >
            Busy
          </button>
        </div>
      </div>
    </div>
  );
}
