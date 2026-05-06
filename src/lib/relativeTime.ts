import { formatDistanceToNowStrict } from 'date-fns';

export function lastCalledText(dateStr: string | null): string {
  if (!dateStr) return 'Never called';
  return `${formatDistanceToNowStrict(new Date(dateStr))} ago`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
