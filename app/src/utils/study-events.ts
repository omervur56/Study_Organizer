import { SUBJECT_ABBREVIATIONS } from '@/constants/subjects';
import type { Activity, ImportantEntry, StudyEvent } from '@/types/study-event';

export const activityTypeLabel = (type: string) =>
  type === 'project' ? 'Projekt' : type === 'task' ? 'Einzelaufgabe' : type === 'exam' ? 'Prüfung' : 'Vorlesung';

// Baut z.B. "programmieren - Einzelaufgabe (PROG)" aus Titel, Typ und Fach einer Tätigkeit.
export const buildActivityDisplayTitle = (activity: Activity) => {
  const typeLabel = activityTypeLabel(activity.type);
  const code = activity.subject ? SUBJECT_ABBREVIATIONS[activity.subject] : undefined;
  return code ? `${activity.title} - ${typeLabel} (${code})` : `${activity.title} - ${typeLabel}`;
};

// Erzeugt für jeden Termin und jede seiner Tätigkeiten einen eigenen Eintrag,
// falls sie wichtig (Prüfung/Projekt/Einzelaufgabe) sind.
export const buildImportantEntries = (items: StudyEvent[]): ImportantEntry[] => {
  const entries: ImportantEntry[] = [];
  items.forEach((event) => {
    if (event.type === 'exam' || event.type === 'project' || event.type === 'task') {
      entries.push({
        id: `${event.id}-main`,
        eventId: event.id,
        title: event.custom_title || event.title,
        type: event.type,
        start_time: event.start_time,
      });
    }
    if (Array.isArray(event.activities)) {
      event.activities.forEach((activity, index) => {
        if (activity.type === 'exam' || activity.type === 'project' || activity.type === 'task') {
          entries.push({
            id: `${event.id}-activity-${index}`,
            eventId: event.id,
            title: buildActivityDisplayTitle(activity),
            type: activity.type,
            start_time: event.start_time,
          });
        }
      });
    }
  });
  return entries;
};

// Moodle-Beschreibungen enthalten Links oft als Fußnoten ("[1] https://...").
const URL_PATTERN = /https?:\/\/[^\s\]]+/g;
export const extractLinks = (text?: string | null): string[] => {
  if (!text) return [];
  const matches = text.match(URL_PATTERN) || [];
  return Array.from(new Set(matches));
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('de-AT', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });

export const formatDayHeader = (date: Date) =>
  date.toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit' });

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export interface DayGroup {
  key: string;
  date: Date;
  events: StudyEvent[];
}

// Fasst Termine, die auf denselben Kalendertag fallen, zu einer Gruppe zusammen, damit
// z.B. ein Uni-Termin und ein privater Termin am selben Tag in einer Karte landen statt
// als zwei getrennte Karten (setzt sortierte Eingabe nach start_time voraus).
export const groupEventsByDay = (items: StudyEvent[]): DayGroup[] => {
  const groups = new Map<string, DayGroup>();
  items.forEach((event) => {
    const date = new Date(event.start_time);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!groups.has(key)) {
      groups.set(key, { key, date, events: [] });
    }
    groups.get(key)!.events.push(event);
  });
  return Array.from(groups.values());
};
