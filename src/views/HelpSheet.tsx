interface Props {
  onClose: () => void;
}

const sections = [
  {
    emoji: '🤍',
    heading: 'What this is',
    body: 'Love People helps you stay consistently close to the people who matter most. You decide who you want to call and how often — the app keeps track and tells you who\'s due.',
  },
  {
    emoji: '👤',
    heading: 'Adding people',
    body: 'Go to the People tab and tap + Add. Give them a name and pick how often you want to connect: Weekly (every 7 days), Monthly (every 30), or Quarterly (every 90). That\'s it.',
  },
  {
    emoji: '📞',
    heading: 'The home screen',
    body: 'Every day, the app surfaces whoever is most overdue. Tap Call, make the call, then come back and log how it went. "No answer" hides them until tomorrow. "Busy" snoozes them for a few hours.',
  },
  {
    emoji: '✍️',
    heading: 'Logging a call',
    body: '"We talked!" opens a short journal — what was memorable, how you can help, how to pray for them, anything to follow up on. All optional. Tap "Just mark it done" if you want to skip it.',
  },
  {
    emoji: '💬',
    heading: 'Topics',
    body: 'Open any contact and tap + Add in "Topics to discuss." Queue up things you want to talk about or text them. When you log a completed call, those topics appear so you can note what came of each one.',
  },
  {
    emoji: '📝',
    heading: 'Quick notes',
    body: 'Jot a thought about someone without logging a call — "saw on Instagram they got a new job," "their dad is in the hospital." Open the contact and type in the Quick notes box.',
  },
  {
    emoji: '🔥',
    heading: 'Streaks',
    body: 'Call someone consistently every week (or month, or quarter) and a streak badge appears on their card. It resets if you miss a full period — a gentle nudge to keep showing up.',
  },
  {
    emoji: '🎂',
    heading: 'Birthdays',
    body: 'Open a contact and tap Add next to Birthday. When their birthday is within two weeks, a reminder card appears at the top of your home screen.',
  },
  {
    emoji: '💼',
    heading: 'Work vs Personal',
    body: 'Toggle between Personal and Work profiles using the switcher in the top right. Each profile has its own separate contact list.',
  },
];

export function HelpSheet({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>
        <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-stone-900">How it works</h2>
          <button onClick={onClose} className="text-stone-400 text-sm min-h-[44px] min-w-[44px] flex items-center justify-end">
            Done
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-8">
          <div className="flex flex-col gap-4">
            {sections.map((s) => (
              <div key={s.heading} className="bg-stone-50 rounded-2xl px-4 py-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-sm font-semibold text-stone-800">{s.heading}</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{s.body}</p>
              </div>
            ))}

            <div className="bg-stone-900 rounded-2xl px-4 py-4">
              <p className="text-sm font-semibold text-white mb-1">One habit, simply</p>
              <p className="text-sm text-stone-400 leading-relaxed">
                Open the app, call whoever is at the top, log it. That's the whole loop. Even 10 minutes a day adds up to a lot of love over a year.
              </p>
            </div>
          </div>
        </div>
        <div className="h-[env(safe-area-inset-bottom)] shrink-0" />
      </div>
    </div>
  );
}
