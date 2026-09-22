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

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('de-AT', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};
