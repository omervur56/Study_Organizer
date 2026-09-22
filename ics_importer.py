import os
import requests
from icalendar import Calendar
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()  # liest Variablen aus einer lokalen .env-Datei, falls vorhanden

# 1. Supabase Konfiguration ausschließlich über Umgebungsvariablen (keine Secrets im Code!)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL und SUPABASE_KEY müssen als Umgebungsvariablen gesetzt sein, "
        "z.B.: export SUPABASE_URL=... und export SUPABASE_KEY=..."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. ICS-Quellen. Zusätzliche Kalender (z.B. der private/Familien-Kalender vom iPhone)
# werden über Umgebungsvariablen eingetragen, damit die geheimen Links nicht im Code landen.
# Beispiel: export PERSONAL_ICS_URL="https://p12-caldav.icloud.com/published/2/...ics"
ICS_URL = os.environ.get("ICS_URL") or (
    "https://cis.hochschule-burgenland.at/webdav/google.php?cal=Ae6CRxpBgMmgHC2ard9n_UUCoVmOPiZc8as1Mi0Hkg0&1789674830.727"
)
PERSONAL_ICS_URL = os.environ.get("PERSONAL_ICS_URL")

# Jede Quelle bekommt einen Default-Typ für neu importierte Termine.
ICS_SOURCES = [{"url": ICS_URL, "default_type": "lecture"}]
if PERSONAL_ICS_URL:
    ICS_SOURCES.append({"url": PERSONAL_ICS_URL, "default_type": "personal"})


def fetch_ics(url):
    """Lädt eine ICS-Datei über den Token-Link herunter."""
    print(f"Lade Kalender herunter: {url[:60]}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    # iCloud-Kalenderlinks werden oft als webcal:// geteilt, requests kennt nur http(s)://
    url = url.replace("webcal://", "https://")

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        if "BEGIN:VCALENDAR" not in response.text:
            print("FEHLER: Keine gültige ICS-Datei.")
            return None
        print("ICS-Datei erfolgreich empfangen.")
        return response.content
    except requests.exceptions.RequestException as e:
        print(f"Netzwerk/HTTP-Fehler: {e}")
        return None

def parse_and_sync(sources):
    # 1. Bestehende Termine aus Supabase laden, um den 'type' zu retten!
    existing_types = {}
    existing_custom_titles = {} # NEU: Wörterbuch für custom ti
 create_client(SUPABASE_URL, SUPABASE_KEY)
        existing_data = supabase.table('study_events').select('id, type, custom_title').execute() # NEU: custom_title mit abfragen
        existing_types = {item['id']: item['type'] for item in existing_data.data}
        existing_custom_titles = {item['id']: item.get('custom_title') for item in existing_data.data} # NEU: custom titles speichern
    except Exception as e:
        print(f"Fehler beim Abrufen bestehender Termine: {e}")

    events_to_upsert = []

    for source in sources:
        ics_content = fetch_ics(source["url"])
        if not ics_content:
            continue

        print("Verarbeite Kalenderdaten...")
        cal = Calendar.from_ical(ics_content)

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

                # 2. Wir übernehmen den alten Typ (falls vorhanden), ansonsten den Default der Quelle
                event_type = existing_types.get(uid, source["default_type"])
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

    # Wiederkehrende Termine (z.B. aus iCloud) können mehrfach mit derselben ID auftauchen,
    # dedupliziert, sonst lehnt Supabase den Upsert ab. Bei Duplikaten gewinnt der letzte Eintrag.
    deduped = {event["id"]: event for event in events_to_upsert}
    events_to_upsert = list(deduped.values())

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
    parse_and_sync(ICS_SOURCES)

if __name__ == "__main__":
    main()