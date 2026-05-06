import type { Contact } from '../types';

export interface UpcomingBirthday {
  contact: Contact;
  daysUntil: number;
  monthDay: string; // "March 15"
}

export function getUpcomingBirthdays(
  contacts: Contact[],
  daysAhead = 14,
  now = new Date()
): UpcomingBirthday[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return contacts
    .filter((c) => c.birthday)
    .map((c) => {
      const [mm, dd] = c.birthday!.split('-').map(Number);
      let bday = new Date(today.getFullYear(), mm - 1, dd);
      if (bday < today) bday = new Date(today.getFullYear() + 1, mm - 1, dd);
      const daysUntil = Math.round((bday.getTime() - today.getTime()) / 86_400_000);
      const monthDay = bday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      return { contact: c, daysUntil, monthDay };
    })
    .filter((b) => b.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function birthdayCountdownText(daysUntil: number): string {
  if (daysUntil === 0) return 'today! 🎉';
  if (daysUntil === 1) return 'tomorrow';
  return `in ${daysUntil} days`;
}
