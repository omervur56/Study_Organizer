// Feste Liste der Fächer mit ihren Kürzeln, wie sie im Tätigkeitstitel angezeigt werden.
export const SUBJECT_ABBREVIATIONS: Record<string, string> = {
  'Mathematik für Wirtschaftsinformatik': 'MWIF',
  'Programmieren': 'PROG',
  'Präsentation & Moderation': 'PRMO',
  'Kommunikation & Kollaboration': 'KOMKO',
  'Betriebssysteme & Netzwerktechnologien': 'BSNT',
  'Einführung Wirtschaftsinformatik': 'EWIF',
};

export const SUBJECT_OPTIONS = Object.keys(SUBJECT_ABBREVIATIONS);
