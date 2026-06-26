import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { router } from 'expo-router';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#00D4FF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B8CAE' },
  section: { padding: 16, marginHorizontal: 12, marginVertical: 8, backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#00D4FF', marginBottom: 12 },
  card: { padding: 12, marginBottom: 8, backgroundColor: '#1A2235', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#00D4FF' },
  cardLabel: { fontSize: 12, color: '#6B8CAE', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#E8F4FD' },
  button: { padding: 12, marginVertical: 6, backgroundColor: '#00D4FF', borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#0A0E1A', fontWeight: '600', fontSize: 14 },
});

export default function HomeScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Xiaomi Flasher</Text>
          <Text style={styles.subtitle}>Firmware Manager & Scooter Control</Text>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scooter Status</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Verbindungsstatus</Text>
            <Text style={styles.cardValue}>Getrennt</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Batterie</Text>
            <Text style={styles.cardValue}>-- %</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Geschwindigkeit</Text>
            <Text style={styles.cardValue}>-- km/h</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schnellzugriff</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/scanner')}>
            <Text style={styles.buttonText}>🔍 Scooter Suchen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/flasher')}>
            <Text style={styles.buttonText}>⚡ Firmware Flashen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
            <Text style={styles.buttonText}>⚙️ Einstellungen</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <Text style={{ color: '#6B8CAE', fontSize: 12, lineHeight: 18 }}>
            Xiaomi Scooter Flasher v1.0.0{'\n'}
            Unterstützt: M365, 4 Pro 2nd Gen, Pro 2, Essential{'\n'}
            {'\n'}
            Starten Sie mit "Scooter Suchen" um ein Gerät zu verbinden.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
