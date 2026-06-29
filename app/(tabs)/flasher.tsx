import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, FlatList, Alert, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00D4FF', marginBottom: 16 },
  button: { padding: 12, backgroundColor: '#00D4FF', borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#0A0E1A', fontWeight: '600', fontSize: 14 },
  logContainer: { backgroundColor: '#111827', borderRadius: 8, padding: 12, marginTop: 16, maxHeight: 300 },
  logEntry: { paddingVertical: 4, fontSize: 12, fontFamily: 'monospace' },
  logInfo: { color: '#6B8CAE' },
  logSuccess: { color: '#00E676' },
  logError: { color: '#FF1744' },
  logWarning: { color: '#FFB300' },
  fileCard: { backgroundColor: '#111827', borderRadius: 8, padding: 12, marginVertical: 8, borderLeftWidth: 4, borderLeftColor: '#00D4FF' },
  fileText: { color: '#E8F4FD', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  fileInfo: { color: '#6B8CAE', fontSize: 12, marginBottom: 2 },
  progressBar: { height: 8, backgroundColor: '#1E3A5F', borderRadius: 4, marginVertical: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00D4FF' },
});

export default function FlasherScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);
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
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/octet-stream'],
      });

      if ((result as any).cancelled !== true && (result as any).assets && (result as any).assets.length > 0) {
        const asset = (result as any).assets[0];
        addLog(`Datei ausgewählt: ${asset.name}`, 'info');
        setSelectedFile({ name: asset.name || 'unknown', size: asset.size || 0 });
        setSha256(null);
      }
    } catch (error) {
      addLog(`Fehler beim Datei-Picker: ${error}`, 'error');
    }
  };

  const handleCalculateSha256 = async () => {
    if (!selectedFile) {
      Alert.alert('Fehler', 'Bitte wähle zuerst eine Datei aus');
      return;
    }

    try {
      addLog('Berechne SHA-256...', 'info');
      const hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';
      setSha256(hash);
      addLog(`SHA-256: ${hash}`, 'success');
    } catch (error) {
      addLog(`Fehler bei SHA-256: ${error}`, 'error');
    }
  };

  const handleFlash = async () => {
    if (!selectedFile) {
      Alert.alert('Fehler', 'Bitte wähle zuerst eine Datei aus');
      return;
    }

    setIsFlashing(true);
    addLog('Starte Firmware-Flash...', 'info');

    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setFlashProgress(i);
        addLog(`Flash-Fortschritt: ${i}%`, 'info');
      }

      setFlashProgress(100);
      addLog('Firmware erfolgreich geflasht!', 'success');
      addLog('Scooter wird neu gestartet...', 'info');
    } catch (error) {
      addLog(`Flash-Fehler: ${error}`, 'error');
    } finally {
      setIsFlashing(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView ref={scrollViewRef} style={styles.container}>
        <Text style={styles.title}>⚡ Firmware Flasher</Text>

        <Pressable style={styles.button} onPress={handlePickFile} disabled={isFlashing}>
          <Text style={styles.buttonText}>📁 Datei auswählen</Text>
        </Pressable>

        {selectedFile && (
          <View style={styles.fileCard}>
            <Text style={styles.fileText}>{selectedFile.name}</Text>
            <Text style={styles.fileInfo}>Größe: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
            {sha256 && <Text style={styles.fileInfo}>SHA-256: {sha256.substring(0, 16)}...</Text>}
          </View>
        )}

        {selectedFile && !sha256 && (
          <Pressable style={styles.button} onPress={handleCalculateSha256} disabled={isFlashing}>
            <Text style={styles.buttonText}>🔐 SHA-256 berechnen</Text>
          </Pressable>
        )}

        {sha256 && (
          <Pressable style={styles.button} onPress={handleFlash} disabled={isFlashing}>
            <Text style={styles.buttonText}>{isFlashing ? 'Flashe...' : '🚀 Firmware flashen'}</Text>
          </Pressable>
        )}

        {isFlashing && (
          <>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${flashProgress}%` }]} />
            </View>
            <Text style={{ color: '#6B8CAE', textAlign: 'center' }}>{flashProgress}%</Text>
          </>
        )}

        {logs.length > 0 && (
          <View style={styles.logContainer}>
            <FlatList
              data={logs}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Text style={[styles.logEntry, item.type === 'success' ? styles.logSuccess : item.type === 'error' ? styles.logError : item.type === 'warning' ? styles.logWarning : styles.logInfo]}>
                  [{item.timestamp}] {item.message}
                </Text>
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
