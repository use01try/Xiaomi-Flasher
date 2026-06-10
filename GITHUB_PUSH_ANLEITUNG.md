# GitHub Push - Schritt für Schritt Anleitung

## Schritt 1: GitHub Account erstellen (falls noch nicht vorhanden)

1. Gehe zu https://github.com
2. Klick "Sign up"
3. Gib deine E-Mail ein
4. Erstelle ein Passwort
5. Wähle einen Benutzernamen (z.B. "dein-name-123")
6. Fertig! ✅

## Schritt 2: Neues Repository erstellen

1. Gehe zu https://github.com/new
2. **Repository name:** `xiaomi-scooter-manager`
3. **Description:** `Xiaomi Scooter Manager - BLE, Firmware, Controller`
4. Wähle **Public** (damit GitHub Actions kostenlos läuft)
5. **NICHT** "Initialize this repository with..." ankreuzen
6. Klick **"Create repository"**

Du siehst jetzt eine Seite mit Befehlen. Diese brauchst du!

## Schritt 3: Code pushen (Terminal/Kommandozeile)

Öffne ein Terminal/Kommandozeile und führe diese Befehle aus:

```bash
# 1. Ins Verzeichnis gehen
cd /home/ubuntu/xiaomi-scooter-manager

# 2. Git konfigurieren (nur beim ersten Mal)
git config user.email "deine-email@example.com"
git config user.name "Dein Name"

# 3. Remote Repository hinzufügen
# WICHTIG: Ersetze "DEIN_USERNAME" mit deinem GitHub Benutzernamen!
git remote add origin https://github.com/DEIN_USERNAME/xiaomi-scooter-manager.git

# 4. Branch umbenennen (falls nötig)
git branch -M main

# 5. Code pushen
git push -u origin main
```

**Beispiel mit echtem Benutzernamen:**
```bash
git remote add origin https://github.com/max-mustermann/xiaomi-scooter-manager.git
```

## Schritt 4: GitHub fragt nach Passwort

Wenn du `git push` ausführst, fragt GitHub nach:
- **Username:** Dein GitHub Benutzername
- **Password:** Dein GitHub Passwort

Gib beides ein und drücke Enter.

## Schritt 5: Warten und APK downloaden

Nach dem Push:
1. Gehe zu deinem Repository: https://github.com/DEIN_USERNAME/xiaomi-scooter-manager
2. Klick auf den **"Actions"** Tab
3. Du siehst "Build APK" Workflow laufen
4. Warte ~15 Minuten bis der Build fertig ist (grüner Haken ✅)
5. Klick auf den Build
6. Scroll down zu **"Artifacts"**
7. Download **"xiaomi-scooter-manager-debug"** (ZIP-Datei)
8. Entpacke die ZIP
9. Du hast die **app-debug.apk** Datei

## Schritt 6: APK auf Handy installieren

1. **Kopiere die APK auf dein Handy** (USB, Cloud, Email, etc.)
2. **Öffne die Datei** auf dem Handy
3. **Erlaube Installation** von unbekannten Quellen
4. **Fertig!** App ist installiert 🎉

---

## Häufige Fehler

### Fehler: "fatal: not a git repository"
**Lösung:** Du bist nicht im richtigen Verzeichnis
```bash
cd /home/ubuntu/xiaomi-scooter-manager
```

### Fehler: "Permission denied (publickey)"
**Lösung:** SSH-Schlüssel Problem. Nutze stattdessen HTTPS:
```bash
git remote set-url origin https://github.com/DEIN_USERNAME/xiaomi-scooter-manager.git
```

### Fehler: "fatal: remote origin already exists"
**Lösung:** Remote existiert schon. Entferne es:
```bash
git remote remove origin
git remote add origin https://github.com/DEIN_USERNAME/xiaomi-scooter-manager.git
```

### Build fehlgeschlagen
**Lösung:** 
1. Gehe zu "Actions" Tab
2. Klick auf den fehlgeschlagenen Build
3. Schau die Logs an
4. Versuche erneut: "Run workflow"

---

## Tipps & Tricks

### Schneller Befehl (alles auf einmal)
```bash
cd /home/ubuntu/xiaomi-scooter-manager && \
git config user.email "deine-email@example.com" && \
git config user.name "Dein Name" && \
git remote add origin https://github.com/DEIN_USERNAME/xiaomi-scooter-manager.git && \
git branch -M main && \
git push -u origin main
```

### Zukünftige Updates pushen
```bash
git add .
git commit -m "Deine Nachricht hier"
git push
```

### Status prüfen
```bash
git status
```

---

## Fertig! 🎉

Nach dem ersten Push:
- GitHub Actions baut automatisch die APK
- Jeder neue Push triggert einen neuen Build
- Du kannst die APK jederzeit downloaden

Viel Erfolg! 🚀
