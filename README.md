# Ski Arlberg Website

## Live-Daten

Diese Website zeigt **ECHTE** Live-Daten an:

### 🌤️ Wetter (via Open-Meteo API)
- Aktuelle Temperatur für Lech Tal und Valluga Berg
- 7-Tage-Vorhersage
- Wind, Sicht, Humidity
- Update: Alle 30 Minuten

### 🚡 Lift-Status (via Liftie API)
- URL: https://liftie.info/api/resort/st-anton-am-arlberg
- Echtzeit-Lift-Status (geöffnet/geschlossen/paused)
- Prozentsatz der offenen Lifte
- Update: Alle 65 Sekunden
- Datenquelle: Liftie (scrapt offizielle Skigebietsseiten)

## Live-URL
https://clawlybot.github.io/ski-arlberg/

## Technologie
- HTML5 + CSS3 (kein Framework)
- Vanilla JavaScript
- Open-Meteo API (kostenlos)
- Liftie.info API (kostenlos)

## Lokale Entwicklung
```bash
# Einfache Python Server starten
python3 -m http.server 8000

# Oder Live Server VS Code Extension
```

## Daten-Probleme?
Falls keine Daten angezeigt werden:
- CORS-Proxy temporär ausgefallen (versuchen Sie später erneut)
- Liftie API kann bei hohem Traffic rate-limited sein
- Daten aktualisieren sich automatisch beim Seitenreload
