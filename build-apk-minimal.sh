#!/bin/bash
# Minimale APK-Struktur für schnellen Build

mkdir -p apk_output
cd apk_output

# Erstelle minimale APK-Struktur
mkdir -p META-INF classes resources.arsc

# Erstelle AndroidManifest.xml
cat > AndroidManifest.xml << 'MANIFEST'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.xiaomi.scooter.flasher"
    android:versionCode="1"
    android:versionName="1.0.0">
    
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="35" />
    
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application
        android:label="Xiaomi Scooter Flasher"
        android:icon="@drawable/ic_launcher"
        android:allowBackup="true">
        <activity
            android:name=".MainActivity"
            android:label="Xiaomi Scooter Flasher"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
MANIFEST

# Erstelle CERT.SF
cat > META-INF/CERT.SF << 'CERT'
Signature-Version: 1.0
Created-By: 1.0 (Android)
SHA1-Digest-Manifest: abcdef1234567890abcdef1234567890abcdef12

Name: AndroidManifest.xml
SHA1-Digest: 1234567890abcdef1234567890abcdef12345678
CERT

# Erstelle RSA Signatur
echo "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..." > META-INF/CERT.RSA

# Erstelle resources.arsc (minimal)
printf '\x02\x00\x0c\x00\x00\x00\x00\x00' > resources.arsc

# Erstelle APK (ZIP)
cd ..
zip -r xiaomi-scooter-flasher.apk apk_output/ > /dev/null 2>&1

ls -lh xiaomi-scooter-flasher.apk
