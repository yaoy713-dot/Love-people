import { useState } from 'react';
import type { Frequency, Profile } from '../types';

interface Props {
  defaultProfile: Profile;
  onSave: (name: string, frequency: Frequency, profile: Profile) => Promise<void>;
  onClose: () => void;
}

const FREQUENCIES: { value: Frequency; label: string; desc: string }[] = [
  { value: 'weekly',    label: 'Weekly',    desc: 'Every week' },
  { value: 'monthly',   label: 'Monthly',   desc: 'Every month' },
  { value: 'quarterly', label: 'Quarterly', desc: 'Every 3 months' },
];

export function AddContactSheet({ defaultProfile, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), frequency, defaultProfile);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 sheet-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl shadow-xl sheet-panel">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>
        <div className="px-5 pb-8 pt-3">
          <h2 className="text-lg font-semibold text-stone-900 mb-5">
            Add {defaultProfile === 'work' ? 'coworker' : 'person'}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name"
              className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              How often do you want to connect?
            </label>
            <div className="flex flex-col gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    frequency === f.value
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  <span className="font-medium text-sm">{f.label}</span>
                  <span className={`text-xs ${frequency === f.value ? 'text-stone-300' : 'text-stone-400'}`}>
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full bg-stone-900 text-white rounded-2xl py-4 font-medium text-base active:scale-95 transition-transform disabled:opacity-40 min-h-[56px]"
          >
            {saving ? 'Adding…' : 'Add person'}
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
