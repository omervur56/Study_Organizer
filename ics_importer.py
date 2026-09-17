import os
import requests
from icalendar import Calendar
from supabase import create_client, Client

# 1. Supabase Konfiguration (Am besten als Umgebungsvariablen setzen)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://oopyvbofzrqytqlifetw.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcHl2Ym9menJxeXRxbGlmZXR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTY2NzY0NSwiZXhwIjoyMTA1MjQzNjQ1fQ.kUycvxJvR7eLxWCbgM-NUMwSpbZB9WiXD1bzNWpuBRo")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. ICS-Datei abrufen
# Alternativ: open('lokaler_kalender.ics', 'rb').read() für lokale Dateien
ICS_URL = "https://cis.hochschule-burgenland.at/webdav/google.php?cal=Ae6CRxpBgMmgHC2ard9n_UUCoVmOPiZc8as1Mi0Hkg0&1789674830.727"

def fetch_and_parse_ics(url):
    print(f"Lade Kalender von {url} herunter...")
    response = requests.get(url)
    response.raise_for_status() # Bricht ab, falls der Download fehlschlägt
    
    # Kalender-Objekt parsen
    cal = Calendar.from_ical(response.content)
    events_to_upsert = []

    for component in cal.walk():
        if component.name == "VEVENT":
            # Wichtige Felder extrahieren
            uid = str(component.get('uid'))
            title = str(component.get('summary'))
            
            # Start- und Endzeitpunkte als ISO-Strings für PostgreSQL aufbereiten
            dtstart = component.get('dtstart').dt
            dtend = component.get('dtend').dt if component.get('dtend') else None
            
            location = str(component.get('location', ''))
            description = str(component.get('description', ''))

            # Simpler Check, ob es eine Prüfung ist (z.B. anhand von Schlagwörtern)
            event_type = "exam" if "klausur" in title.lower() or "prüfung" in title.lower() else "lecture"

            # Das Dictionary muss exakt den Spaltennamen in deiner Supabase-Tabelle entsprechen
            events_to_upsert.append({
                "id": uid, # Dient als Primärschlüssel für den Upsert
                "title": title,
                "start_time": dtstart.isoformat() if hasattr(dtstart, 'isoformat') else str(dtstart),
                "end_time": dtend.isoformat() if hasattr(dtend, 'isoformat') else str(dtend),
                "location": location,
                "description": description,
                "type": event_type
            })

    return events_to_upsert

def main():
    events = fetch_and_parse_ics(ICS_URL)
    print(f"{len(events)} Termine gefunden. Starte Datenbank-Sync...")

    if events:
        # 3. Daten in Supabase schreiben (Upsert)
        # Wichtig: Die Spalte 'id' muss in Supabase als Primary Key oder Unique definiert sein!
        try:
            response = (
                supabase.table('study_events')
                .upsert(events)
                .execute()
            )
            print("Erfolgreich synchronisiert!")
        except Exception as e:
            print(f"Fehler beim Speichern in Supabase: {e}")

if __name__ == "__main__":
    main()
