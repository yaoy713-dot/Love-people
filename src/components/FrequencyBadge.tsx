import type { Frequency } from '../types';

const styles: Record<Frequency, string> = {
  weekly:    'bg-purple-100 text-purple-700',
  monthly:   'bg-blue-100 text-blue-700',
  quarterly: 'bg-green-100 text-green-700',
};

const labels: Record<Frequency, string> = {
  weekly:    'Weekly',
  monthly:   'Monthly',
  quarterly: 'Quarterly',
};

export function FrequencyBadge({ frequency }: { frequency: Frequency }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[frequency]}`}>
      {labels[frequency]}
    </span>
  );
}
