#!/bin/bash
set -e

echo "🚀 Starte APK Build..."

# 1. Prebuild
echo "📦 Step 1: Prebuild..."
yes | npx expo@latest prebuild --clean --platform android --no-install 2>&1 | grep -E "✔|Finished" || true

# 2. SDK Setup
echo "🔧 Step 2: SDK Setup..."
export ANDROID_HOME=/usr/lib/android-sdk
cd android
echo "sdk.dir=/usr/lib/android-sdk" > local.properties

# 3. Gradle Build
echo "🏗️  Step 3: Gradle Build (Debug APK)..."
./gradlew app:assembleDebug --parallel --max-workers=8 2>&1 | grep -E "BUILD|SUCCESS|app-debug" | tail -20

# 4. Prüfe APK
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
  echo "✅ APK FERTIG: $SIZE"
  cp app/build/outputs/apk/debug/app-debug.apk /home/ubuntu/xiaomi-scooter-manager/xiaomi-scooter-manager.apk
  echo "✅ APK bereit zum Download!"
else
  echo "❌ Build fehlgeschlagen"
  exit 1
fi
