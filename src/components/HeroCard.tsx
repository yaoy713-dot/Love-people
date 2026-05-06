import { FrequencyBadge } from './FrequencyBadge';
import { lastCalledText, initials } from '../lib/relativeTime';
import type { DashboardCard } from '../hooks/useDashboard';

interface Props {
  card: DashboardCard;
  onCall: () => void;
  onBusy: () => void;
  onSelect: () => void;
}

export function HeroCard({ card, onCall, onBusy, onSelect }: Props) {
  const { contact, showTextPrompt, lastCalledDate, isExiting } = card;

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border-l-4 border-[#f97066] p-4 transition-all duration-350 ${
        isExiting ? 'slide-out' : 'slide-in'
      }`}
    >
      {showTextPrompt && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 text-xs text-amber-700 font-medium">
          3 tries — consider texting {contact.name} to schedule a call
        </div>
      )}

      <button onClick={onSelect} className="flex items-center gap-3 mb-4 w-full text-left">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-semibold text-lg shrink-0">
          {initials(contact.name)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-stone-900 text-xl leading-tight">{contact.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <FrequencyBadge frequency={contact.frequency} />
            <span className="text-xs text-stone-400">{lastCalledText(lastCalledDate)}</span>
          </div>
        </div>
      </button>

      <div className="flex gap-2">
        <button
          onClick={onCall}
          className="flex-1 bg-stone-900 text-white rounded-xl py-3 font-medium text-sm active:scale-95 transition-transform min-h-[44px]"
        >
          Call
        </button>
        <button
          onClick={onBusy}
          className="bg-stone-100 text-stone-600 rounded-xl px-5 py-3 font-medium text-sm active:scale-95 transition-transform min-h-[44px]"
        >
          Busy
        </button>
      </div>
    </div>
  );
}
