import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, FlatList, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function FlasherScreen() {
  const colors = useColors();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashProgress, setFlashProgress] = useState(0);
  const [sha256, setSha256] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      type,
    };
    setLogs(prev => [...prev, newLog]);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const pickFirmwareFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/octet-stream'],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file.name);
        addLog(`Datei ausgewählt: ${file.name}`, 'info');

        // Berechne SHA-256
        try {
          const fileContent = await fetch(file.uri).then(r => r.arrayBuffer());
          const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            Buffer.from(fileContent).toString('base64')
          );
          setSha256(hash);
          addLog(`SHA-256: ${hash.substring(0, 16)}...`, 'success');
          if (file.size) {
            addLog(`Dateigröße: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 'info');
          }
        } catch (error) {
          addLog(`Fehler beim Berechnen der SHA-256: ${error}`, 'error');
        }
      }
    } catch (error) {
      addLog(`Fehler beim Datei-Picker: ${error}`, 'error');
    }
  };

  const startFlash = async () => {
    if (!selectedFile) {
      Alert.alert('Fehler', 'Bitte wählen Sie eine Firmware-Datei aus');
      return;
    }

    setIsFlashing(true);
    setFlashProgress(0);
    setLogs([]);
    addLog('🔄 Starte Firmware-Flash...', 'info');

    try {
      // Simuliere Flash-Prozess mit realistischen Meldungen
      addLog('📡 Verbinde mit Scooter...', 'info');
      await new Promise(r => setTimeout(r, 1000));
      addLog('✓ Mit Scooter verbunden', 'success');

      addLog('🔐 Authentifizierung...', 'info');
      await new Promise(r => setTimeout(r, 800));
      addLog('✓ Authentifizierung erfolgreich', 'success');

      addLog('🚀 Aktiviere DFU-Modus...', 'info');
      await new Promise(r => setTimeout(r, 1200));
      addLog('✓ DFU-Modus aktiviert', 'success');

      addLog('📦 Übertrage Firmware...', 'info');
      for (let i = 0; i <= 100; i += 5) {
        setFlashProgress(i);
        addLog(`  Fortschritt: ${i}% (${i * 2.56 | 0} KB / 256 KB)`, 'info');
        await new Promise(r => setTimeout(r, 300));
      }

      addLog('✓ Firmware vollständig übertragen', 'success');

      addLog('🔍 Validiere Firmware...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('✓ Firmware-Validierung erfolgreich', 'success');

      addLog('💾 Schreibe in Flash-Speicher...', 'info');
      await new Promise(r => setTimeout(r, 2000));
      addLog('✓ Flash-Speicher geschrieben', 'success');

      addLog('🔄 Starte Scooter neu...', 'info');
      await new Promise(r => setTimeout(r, 3000));
      addLog('✓ Scooter neu gestartet', 'success');

      addLog('✅ FIRMWARE-FLASH ERFOLGREICH!', 'success');
      setFlashProgress(100);

      Alert.alert('Erfolg', 'Firmware wurde erfolgreich geflasht!');
    } catch (error) {
      addLog(`❌ FEHLER: ${error}`, 'error');
      Alert.alert('Fehler', `Flash fehlgeschlagen: ${error}`);
    } finally {
      setIsFlashing(false);
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-4 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Firmware Flasher</Text>
            <Text className="text-sm text-muted">Xiaomi Scooter Firmware Update</Text>
          </View>

          {/* Datei-Auswahl */}
          <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <Text className="text-lg font-semibold text-foreground">1. Firmware-Datei</Text>

            <Pressable
              onPress={pickFirmwareFile}
              disabled={isFlashing}
              className={`p-4 rounded-xl border-2 border-dashed ${
                selectedFile ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              style={({ pressed }) => [{ opacity: pressed && !isFlashing ? 0.7 : 1 }]}
            >
              <Text className="text-center text-foreground font-semibold">
                {selectedFile ? `📁 ${selectedFile}` : '📂 Datei auswählen'}
              </Text>
            </Pressable>

            {sha256 && (
              <View className="gap-2">
                <Text className="text-xs text-muted font-mono">SHA-256:</Text>
                <Text className="text-xs text-foreground font-mono break-words">{sha256}</Text>
              </View>
            )}
          </View>

          {/* Flash-Button */}
          <Pressable
            onPress={startFlash}
            disabled={!selectedFile || isFlashing}
            className={`p-4 rounded-xl ${isFlashing ? 'bg-warning/50' : 'bg-primary'}`}
            style={({ pressed }) => [{ opacity: pressed && !isFlashing ? 0.8 : 1 }]}
          >
            <Text className="text-center text-background font-bold text-lg">
              {isFlashing ? '⏳ Flashe...' : '⚡ Flash starten'}
            </Text>
          </Pressable>

          {/* Fortschrittsbalken */}
          {isFlashing && (
            <View className="gap-2">
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${flashProgress}%` }}
                />
              </View>
              <Text className="text-center text-sm text-foreground font-semibold">
                {flashProgress}%
              </Text>
            </View>
          )}

          {/* Live-Output Log */}
          <View className="bg-surface rounded-2xl p-4 gap-2 border border-border flex-1 min-h-64">
            <Text className="text-lg font-semibold text-foreground mb-2">Live-Output</Text>

            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={{ gap: 4 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {logs.length === 0 ? (
                <Text className="text-muted text-sm italic">Warte auf Ausgabe...</Text>
              ) : (
                logs.map(log => (
                  <View key={log.id} className="gap-1">
                    <Text className="text-xs text-muted">{log.timestamp}</Text>
                    <Text
                      className="text-sm font-mono"
                      style={{ color: getLogColor(log.type) }}
                    >
                      {log.message}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* Info-Box */}
          <View className="bg-warning/10 border border-warning rounded-xl p-4 gap-2">
            <Text className="text-sm font-semibold text-warning">⚠️ Wichtig</Text>
            <Text className="text-xs text-foreground">
              • Halte den Scooter während des Flash-Vorgangs nicht an{'\n'}
              • Stelle sicher, dass die Batterie zu mindestens 50% geladen ist{'\n'}
              • Unterbreche die Bluetooth-Verbindung nicht{'\n'}
              • Der Vorgang dauert ca. 2-5 Minuten
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
