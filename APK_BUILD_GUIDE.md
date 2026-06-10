# Xiaomi Scooter Manager – APK-Build-Anleitung

Diese App ist eine vollständige native Android-Anwendung für Xiaomi-Scooter-Verwaltung und Diagnose mit echtem Bluetooth Low Energy (BLE) Support.

## Schnellstart: APK generieren

### Option 1: Mit Expo Cloud Build (empfohlen)

```bash
# 1. Expo CLI installieren (falls nicht vorhanden)
npm install -g expo-cli

# 2. In das Projektverzeichnis wechseln
cd /home/ubuntu/xiaomi-scooter-manager

# 3. Mit Expo-Konto anmelden
expo login

# 4. APK bauen
eas build --platform android --local

# 5. APK wird im Verzeichnis `dist/` gespeichert
```

### Option 2: Lokal mit Android Studio

```bash
# 1. Android Studio installieren (falls nicht vorhanden)
# https://developer.android.com/studio

# 2. Android SDK und NDK installieren
# Mindestens: SDK 24 (Android 7.0) und SDK 34 (Android 14)

# 3. Expo prebuild ausführen
expo prebuild --clean

# 4. Mit Android Studio öffnen
android/

# 5. Build → Generate Signed Bundle / APK
```

### Option 3: Mit Gradle (Kommandozeile)

```bash
# 1. Expo prebuild
expo prebuild --clean

# 2. Gradle Build
cd android
./gradlew assembleRelease

# 3. APK befindet sich in: app/build/outputs/apk/release/
```

## Voraussetzungen

- **Node.js** 18+ und pnpm
- **Expo CLI** (`npm install -g expo-cli`)
- **Android SDK** (API Level 24+)
- **Keystore** für Signierung (wird bei erstem Build erstellt)

## Berechtigungen

Die App benötigt folgende Android-Berechtigungen:

| Berechtigung | Zweck |
|---|---|
| `BLUETOOTH` | Bluetooth-Verbindung zu Scooter |
| `BLUETOOTH_ADMIN` | Bluetooth-Geräteverwaltung |
| `BLUETOOTH_SCAN` | BLE-Gerätesuche |
| `BLUETOOTH_CONNECT` | BLE-Verbindung |
| `ACCESS_FINE_LOCATION` | GPS für BLE-Scan (Android 6+) |
| `ACCESS_COARSE_LOCATION` | Ungefährer Standort für BLE |
| `READ_EXTERNAL_STORAGE` | Firmware-Dateien lesen |
| `WRITE_EXTERNAL_STORAGE` | Firmware-Dateien speichern |
| `POST_NOTIFICATIONS` | Push-Benachrichtigungen |

## Features

### Dashboard
- Verbindungsstatus mit Puls-Animation
- Echtzeit-Metriken: Batterie, Geschwindigkeit, Temperatur, Spannung
- Fahrmodus-Anzeige und Schnellzugriff

### BLE-Scanner
- Automatische Gerätesuche mit Puls-Animation
- Gerätename, MAC-Adresse, RSSI-Signalstärke
- One-Tap-Verbindung mit Auto-Reconnect

### Scooter-Informationen
- Seriennummer, Modellname, Firmware-Version
- Akkustand-Gauge mit Farbcodierung
- Temperatur-Monitoring (Akku & Motor)
- Fahrmodus-Umschalter (Eco/Sport/Custom)

### Firmware-Manager
- Datei-Bibliothek (.bin, .zip)
- SHA-256-Berechnung und Integritätsprüfung
- Flash-Fortschrittsbalken
- Bestätigungs-Dialog mit Sicherheitswarnungen

### Controller-Modifikation
- 6 Schieberegler für Parameter:
  - Geschwindigkeitslimit (10-35 km/h)
  - Motorleistung (100-600 W)
  - Bremsstärke (20-100%)
  - Beschleunigungskurve (1-100%)
  - Tempomat-Geschwindigkeit (5-30 km/h)
  - Rekuperationsbremse (0-100%)

### Bootloader-Funktionen
- DFU-Modus aktivieren
- Werksreset durchführen
- EU-Geschwindigkeitssperre entfernen
- Diagnose-Dump auslesen

## Technische Details

| Aspekt | Wert |
|---|---|
| **Framework** | React Native + Expo 54 |
| **Sprache** | TypeScript |
| **Styling** | NativeWind (Tailwind CSS) |
| **State Management** | React Context + AsyncStorage |
| **BLE** | Expo-BLE (Simulator) / react-native-ble-plx (Production) |
| **Min. SDK** | 24 (Android 7.0) |
| **Target SDK** | 34 (Android 14) |
| **Architectures** | arm64-v8a, armeabi-v7a |

## Debugging

### Logs anzeigen
```bash
adb logcat | grep "Xiaomi\|BLE\|Scooter"
```

### App auf Gerät installieren
```bash
adb install app-release.apk
```

### Gerät mit USB-Debugging verbinden
1. Einstellungen → Entwickleroptionen → USB-Debugging aktivieren
2. `adb devices` ausführen
3. APK installieren mit `adb install`

## Troubleshooting

### "Bluetooth permission denied"
- Stelle sicher, dass die App die Berechtigungen erhalten hat
- Einstellungen → Apps → Xiaomi Scooter Manager → Berechtigungen → Bluetooth aktivieren

### "Cannot find Scooter"
- Stelle sicher, dass der Scooter eingeschaltet und in Reichweite ist
- Versuche, den Scooter neu zu starten
- Überprüfe, ob andere Apps Bluetooth blockieren

### "Flash failed"
- Stelle sicher, dass die Firmware-Datei korrekt ist (SHA-256 prüfen)
- Batterie muss mindestens 50% sein
- Scooter darf während des Flash nicht getrennt werden

## Lizenz

Diese App ist für persönliche Nutzung mit Xiaomi-Scootern gedacht. Verwende sie auf eigene Gefahr.

## Support

Für Fragen oder Probleme: Kontaktiere den Entwickler oder öffne ein Issue auf GitHub.
