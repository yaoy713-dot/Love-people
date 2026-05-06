import { differenceInDays, isToday, isYesterday } from 'date-fns';

export function lastCalledText(dateStr: string | null): string {
  if (!dateStr) return 'Never called';
  const date = new Date(dateStr);
  if (isToday(date)) return 'Called today';
  if (isYesterday(date)) return 'Called yesterday';
  const days = differenceInDays(new Date(), date);
  return `${days} days ago`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
