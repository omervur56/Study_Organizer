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

// Umkehrung von SUBJECT_ABBREVIATIONS, um z.B. aus Moodle-Kurskürzeln ("...-BSNT")
// wieder den vollen Fachnamen anzuzeigen.
export const ABBREVIATION_TO_SUBJECT: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_ABBREVIATIONS).map(([subject, abbr]) => [abbr, subject])
);

export const MOODLE_BASE_URL = 'https://moodle.hochschule-burgenland.at';

// Moodle liefert die Kurs-ID nicht über den ICS-Export, daher hier manuell pflegen
// (ID steht in der Browser-Adresszeile des Kurses: course/view.php?id=...).
export const MOODLE_COURSE_IDS: Record<string, number> = {
  BSNT: 25044,
};
