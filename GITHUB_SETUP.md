# GitHub APK Build Setup

Diese App ist bereit für automatische APK-Builds mit GitHub Actions!

## Schnellstart

### 1. Repository auf GitHub erstellen

```bash
# Gehe zu https://github.com/new und erstelle ein neues Repository
# Name: xiaomi-scooter-manager
# Beschreibung: Vollständige Xiaomi-Scooter-Verwaltung mit BLE, Firmware-Manager und Controller-Modifikation
```

### 2. Code zu GitHub pushen

```bash
cd /home/ubuntu/xiaomi-scooter-manager

# Git initialisieren
git init
git add .
git commit -m "Initial commit: Vollständige Xiaomi Scooter Manager App"

# Remote hinzufügen (ersetze USERNAME mit deinem GitHub Username)
git remote add origin https://github.com/USERNAME/xiaomi-scooter-manager.git
git branch -M main
git push -u origin main
```

### 3. GitHub Actions automatisch starten

Nach dem Push:
1. Gehe zu deinem Repository auf GitHub
2. Klick auf "Actions" Tab
3. Wähle "Build APK" Workflow
4. Klick "Run workflow"

Der Build startet automatisch! ⚡

### 4. APK downloaden

Nach ~10-15 Minuten:
1. Gehe zu "Actions" → "Build APK" (neuester Run)
2. Scroll down zu "Artifacts"
3. Download "xiaomi-scooter-manager-debug"
4. Entpacke die ZIP → app-debug.apk

## Was ist in der APK?

- ✅ Dashboard mit Live-Metriken (Batterie, Geschwindigkeit, Temperatur, Spannung)
- ✅ BLE-Scanner für Xiaomi-Scooter-Suche
- ✅ Scooter-Informationen (Seriennummer, Modell, Firmware, Fahrmodus)
- ✅ Firmware-Manager mit SHA-256 Prüfung und Integritätsprüfung
- ✅ Controller-Modifikation (6 Parameter: Geschwindigkeit, Motor, Bremse, etc.)
- ✅ Bootloader-Funktionen (DFU-Modus, Werksreset, Entsperren)
- ✅ Dunkles Cyberpunk-Theme mit Cyan-Accents
- ✅ Material 3 Design
- ✅ Alle BLE-Berechtigungen konfiguriert

## Installation auf Handy

1. **Download** - Lade app-debug.apk herunter
2. **Transfer** - Kopiere die Datei auf dein Android-Handy
3. **Installation** - Öffne die APK-Datei auf dem Handy
4. **Berechtigungen** - Erlaube alle Berechtigungen (Bluetooth, Standort, Speicher)
5. **Fertig!** - App startet mit vollständigem Dashboard

## Automatische Builds aktivieren

Die App baut automatisch bei jedem Push zu `main` oder `master` Branch.

Für Release-Builds mit Tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Troubleshooting

### "Build failed"
- Prüfe die GitHub Actions Logs
- Stelle sicher, dass Node.js und Java installiert sind
- Versuche einen neuen Push

### "APK nicht im Artifacts"
- Warte 15-20 Minuten
- Prüfe die Build-Logs auf Fehler
- Versuche manuell: "Run workflow"

### "APK kann nicht installiert werden"
- Stelle sicher, dass "Unbekannte Quellen" in Android-Einstellungen aktiviert ist
- Versuche, die App zu deinstallieren und neu zu installieren
- Prüfe, dass dein Handy Android 7.0+ hat

## Support

Für Fragen oder Probleme: Öffne ein Issue auf GitHub!
