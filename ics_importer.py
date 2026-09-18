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

def fetch_ics():
    """Lädt die ICS-Datei über den Token-Link herunter."""
    print("Lade Stundenplan über Token-Link herunter...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(ICS_URL, headers=headers)
        response.raise_for_status()
        if "BEGIN:VCALENDAR" not in response.text:
            print("FEHLER: Keine gültige ICS-Datei.")
            return None
        print("ICS-Datei erfolgreich empfangen.")
        return response.content
    except requests.exceptions.RequestException as e:
        print(f"Netzwerk/HTTP-Fehler: {e}")
        return None

def parse_and_sync(ics_content):
    if not ics_content:
        return
        
    print("Verarbeite Kalenderdaten...")
    cal = Calendar.from_ical(ics_content)
    
    # 1. Bestehende Termine aus Supabase laden, um den 'type' zu retten!
    existing_types = {}
    existing_custom_titles = {} # NEU: Wörterbuch für custom titles
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        existing_data = supabase.table('study_events').select('id, type, custom_title').execute() # NEU: custom_title mit abfragen
        existing_types = {item['id']: item['type'] for item in existing_data.data}
        existing_custom_titles = {item['id']: item.get('custom_title') for item in existing_data.data} # NEU: custom titles speichern
    except Exception as e:
        print(f"Fehler beim Abrufen bestehender Termine: {e}")

    events_to_upsert = []

    for component in cal.walk():
        if component.name == "VEVENT":
            uid = str(component.get('uid'))
            title = str(component.get('summary', 'Ohne Titel'))
            dtstart = component.get('dtstart')
            dtend = component.get('dtend')
            
            if not dtstart:
                continue
                
            start_iso = dtstart.dt.isoformat() if hasattr(dtstart.dt, 'isoformat') else str(dtstart.dt)
            end_iso = dtend.dt.isoformat() if dtend and hasattr(dtend.dt, 'isoformat') else str(dtend.dt) if dtend else None
            location = str(component.get('location', ''))
            description = str(component.get('description', ''))

            # 2. Wir übernehmen den alten Typ (falls vorhanden), ansonsten 'lecture'
            event_type = existing_types.get(uid, "lecture")
            custom_title = existing_custom_titles.get(uid, None) # NEU: custom title holen

            events_to_upsert.append({
                "id": uid,
                "title": title,
                "start_time": start_iso,
                "end_time": end_iso,
                "location": location,
                "description": description,
                "type": event_type,
                "custom_title": custom_title # NEU: custom title ins upsert einfügen
            })

    print(f"{len(events_to_upsert)} Termine gefunden. Starte Sync mit Supabase...")
    
    if not events_to_upsert:
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        supabase.table('study_events').upsert(events_to_upsert).execute()
        print("Erfolgreich synchronisiert!")
    except Exception as e:
        print(f"Fehler beim Supabase-Sync: {e}")

def main():
    ics_content = fetch_ics()
    if ics_content:
        parse_and_sync(ics_content)

if __name__ == "__main__":
    main()