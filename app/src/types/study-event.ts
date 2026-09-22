export interface Activity {
  title: string;
  type: string;
  subject?: string | null;
}

export interface StudyEvent {
  id: string;
  title: string;
  custom_title?: string | null;
  type: string;
  start_time: string;
  end_time?: string;
  location?: string;
  description?: string;
  activities?: Activity[];
}

export interface ImportantEntry {
  id: string;
  title: string;
  type: string;
  start_time: string;
}
