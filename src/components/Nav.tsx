import type { ActiveView } from '../types';

interface Props {
  active: ActiveView;
  onChange: (v: ActiveView) => void;
}

const tabs: { id: ActiveView; label: string; icon: string }[] = [
  { id: 'home',     label: 'Today',   icon: '📞' },
  { id: 'contacts', label: 'People',  icon: '👥' },
  { id: 'history',  label: 'History', icon: '🕐' },
];

export function Nav({ active, onChange }: Props) {
  return (
    <nav className="shrink-0 bg-white border-t border-stone-100 flex pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center py-2 min-h-[56px] transition-colors ${
            active === tab.id ? 'text-stone-900' : 'text-stone-400'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className={`text-[10px] font-medium mt-0.5 ${active === tab.id ? 'text-stone-900' : 'text-stone-400'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
