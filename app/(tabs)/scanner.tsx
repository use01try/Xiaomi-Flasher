import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00D4FF', marginBottom: 16 },
  button: { padding: 14, backgroundColor: '#00D4FF', borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#0A0E1A', fontWeight: '600', fontSize: 14 },
  deviceList: { marginTop: 16 },
  deviceCard: { padding: 12, marginBottom: 8, backgroundColor: '#111827', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#00E676' },
  deviceName: { fontSize: 14, fontWeight: '600', color: '#E8F4FD', marginBottom: 4 },
  deviceInfo: { fontSize: 12, color: '#6B8CAE', marginBottom: 2 },
  connectButton: { padding: 8, backgroundColor: '#00D4FF', borderRadius: 6, marginTop: 8, alignItems: 'center' },
  connectButtonText: { color: '#0A0E1A', fontWeight: '600', fontSize: 12 },
});

export default function ScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setDevices([
        { id: '1', name: 'Xiaomi M365', mac: 'AA:BB:CC:DD:EE:01', rssi: -45 },
        { id: '2', name: 'Xiaomi 4 Pro 2nd', mac: 'AA:BB:CC:DD:EE:02', rssi: -62 },
      ]);
      setScanning(false);
    }, 3000);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🔍 Scooter Suchen</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleScan} disabled={scanning}>
          <Text style={styles.buttonText}>
            {scanning ? 'Suche läuft...' : 'Scan Starten'}
          </Text>
        </TouchableOpacity>

        {scanning && <ActivityIndicator size="large" color="#00D4FF" style={{ marginVertical: 20 }} />}

        {devices.length > 0 && (
          <View style={styles.deviceList}>
            <Text style={{ color: '#6B8CAE', marginBottom: 8 }}>
              {devices.length} Gerät{devices.length !== 1 ? 'e' : ''} gefunden
            </Text>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceInfo}>MAC: {device.mac}</Text>
                <Text style={styles.deviceInfo}>Signal: {device.rssi} dBm</Text>
                <TouchableOpacity style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>Verbinden</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
