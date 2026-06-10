#!/bin/bash

# Xiaomi Scooter Manager – APK Build Script
# Dieses Skript erstellt eine native Android-APK

set -e

echo "🚀 Xiaomi Scooter Manager – APK Build"
echo "======================================"
echo ""

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Schritt 1: Abhängigkeiten prüfen
echo -e "${BLUE}[1/5]${NC} Abhängigkeiten prüfen..."
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}❌ Node.js nicht gefunden. Bitte installiere Node.js 18+${NC}"
  exit 1
fi
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}⚠️  pnpm nicht gefunden. Installiere es mit: npm install -g pnpm${NC}"
  npm install -g pnpm
fi
if ! command -v expo &> /dev/null; then
  echo -e "${YELLOW}⚠️  Expo CLI nicht gefunden. Installiere es mit: npm install -g expo-cli${NC}"
  npm install -g expo-cli
fi
echo -e "${GREEN}✓ Abhängigkeiten OK${NC}"
echo ""

# Schritt 2: Dependencies installieren
echo -e "${BLUE}[2/5]${NC} Dependencies installieren..."
pnpm install --frozen-lockfile 2>&1 | tail -5
echo -e "${GREEN}✓ Dependencies installiert${NC}"
echo ""

# Schritt 3: TypeScript prüfen
echo -e "${BLUE}[3/5]${NC} TypeScript-Fehler prüfen..."
pnpm check || true
echo -e "${GREEN}✓ TypeScript-Check abgeschlossen${NC}"
echo ""

# Schritt 4: Expo prebuild
echo -e "${BLUE}[4/5]${NC} Expo prebuild ausführen..."
echo "  (Dies erstellt die native Android-Projektstruktur)"
expo prebuild --clean --platform android 2>&1 | grep -E "✓|✗|Prebuild|android" || true
echo -e "${GREEN}✓ Prebuild abgeschlossen${NC}"
echo ""

# Schritt 5: APK bauen
echo -e "${BLUE}[5/5]${NC} APK bauen..."
echo "  (Dies kann 5-10 Minuten dauern...)"
cd android
./gradlew assembleRelease 2>&1 | tail -10
cd ..

# Prüfe ob APK erstellt wurde
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
  APK_SIZE=$(du -h "android/app/build/outputs/apk/release/app-release.apk" | cut -f1)
  echo ""
  echo -e "${GREEN}✅ APK erfolgreich erstellt!${NC}"
  echo ""
  echo "📦 APK-Informationen:"
  echo "  Pfad: android/app/build/outputs/apk/release/app-release.apk"
  echo "  Größe: $APK_SIZE"
  echo ""
  echo "📱 Installation auf Gerät:"
  echo "  adb install android/app/build/outputs/apk/release/app-release.apk"
  echo ""
  echo "🎉 Fertig! Die App ist bereit zum Installieren."
else
  echo -e "${YELLOW}❌ APK-Build fehlgeschlagen. Überprüfe die Logs oben.${NC}"
  exit 1
fi
