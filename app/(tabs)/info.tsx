import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useBle } from '@/context/ble-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

const C = {
  bg: '#0A0E1A',
  surface: '#111827',
  surfaceEl: '#1A2235',
  primary: '#00D4FF',
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF1744',
  accent: '#FF6B35',
  fg: '#E8F4FD',
  muted: '#6B8CAE',
  border: '#1E3A5F',
};

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.monoText]}>{value}</Text>
    </View>
  );
}

function GaugeBar({ value, max, color, label, unit }: {
  value: number; max: number; color: string; label: string; unit: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeHeader}>
        <Text style={styles.gaugeLabel}>{label}</Text>
        <Text style={[styles.gaugeValue, { color }]}>{value} {unit}</Text>
      </View>
      <View style={[styles.gaugeTrack, { backgroundColor: C.border }]}>
        <View style={[styles.gaugeFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function RideModeButton({ mode, label, icon, color, active, onPress }: {
  mode: string; label: string; icon: string; color: string; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.modeBtn, { borderColor: active ? color : C.border, backgroundColor: active ? color + '20' : C.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconSymbol name={icon as any} size={22} color={active ? color : C.muted} />
      <Text style={[styles.modeBtnText, { color: active ? color : C.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function InfoScreen() {
  const { connectionStatus, scooterInfo, refreshScooterInfo, setRideMode, connectedDevice } = useBle();
  const isConnected = connectionStatus === 'connected';
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    refreshScooterInfo();
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  const handleModeChange = (mode: 'eco' | 'sport' | 'custom') => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRideMode(mode);
  };

  if (!isConnected || !scooterInfo) {
    return (
      <ScreenContainer containerClassName="bg-[#0A0E1A]">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scooter-Info</Text>
          <Text style={styles.headerSub}>Geräteinformationen & Diagnose</Text>
        </View>
        <View style={styles.notConnected}>
          <IconSymbol name="electric-scooter" size={72} color={C.border} />
          <Text style={styles.notConnTitle}>Nicht verbunden</Text>
          <Text style={styles.notConnDesc}>Verbinde zuerst deinen Xiaomi-Scooter über den Scanner-Tab.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Scooter-Info</Text>
            <Text style={styles.headerSub}>{scooterInfo.modelName}</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <IconSymbol name={refreshing ? "arrow.triangle.2.circlepath" : "arrow.clockwise"} size={20} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Device Identity Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geräteinformationen</Text>
          <View style={[styles.card, { borderColor: C.primary + '40' }]}>
            <InfoRow label="Seriennummer" value={scooterInfo.serialNumber} mono />
            <View style={styles.divider} />
            <InfoRow label="Modell" value={scooterInfo.modelName} />
            <View style={styles.divider} />
            <InfoRow label="Firmware-Version" value={`v${scooterInfo.firmwareVersion}`} mono />
            <View style={styles.divider} />
            <InfoRow label="MAC-Adresse" value={connectedDevice?.mac ?? '—'} mono />
          </View>
        </View>

        {/* Battery & Power */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akku & Leistung</Text>
          <View style={[styles.card, { borderColor: C.border }]}>
            <GaugeBar
              value={scooterInfo.batteryLevel}
              max={100}
              color={scooterInfo.batteryLevel > 50 ? C.success : scooterInfo.batteryLevel > 20 ? C.warning : C.error}
              label="Akkustand"
              unit="%"
            />
            <View style={styles.divider} />
            <GaugeBar value={scooterInfo.voltage} max={54} color={C.primary} label="Spannung" unit="V" />
          </View>
        </View>

        {/* Temperature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperatur</Text>
          <View style={styles.tempRow}>
            <View style={[styles.tempCard, { borderColor: C.warning + '40' }]}>
              <IconSymbol name="thermometer" size={24} color={C.warning} />
              <Text style={[styles.tempValue, { color: C.warning }]}>{scooterInfo.temperature}°C</Text>
              <Text style={styles.tempLabel}>Akku-Temp.</Text>
            </View>
            <View style={[styles.tempCard, { borderColor: C.accent + '40' }]}>
              <IconSymbol name="thermometer" size={24} color={C.accent} />
              <Text style={[styles.tempValue, { color: C.accent }]}>{scooterInfo.motorTemp}°C</Text>
              <Text style={styles.tempLabel}>Motor-Temp.</Text>
            </View>
          </View>
        </View>

        {/* Ride Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fahrmodus</Text>
          <View style={styles.modeRow}>
            <RideModeButton
              mode="eco"
              label="Eco"
              icon="bolt.fill"
              color={C.success}
              active={scooterInfo.rideMode === 'eco'}
              onPress={() => handleModeChange('eco')}
            />
            <RideModeButton
              mode="sport"
              label="Sport"
              icon="speedometer"
              color={C.accent}
              active={scooterInfo.rideMode === 'sport'}
              onPress={() => handleModeChange('sport')}
            />
            <RideModeButton
              mode="custom"
              label="Custom"
              icon="slider.horizontal.3"
              color={C.primary}
              active={scooterInfo.rideMode === 'custom'}
              onPress={() => handleModeChange('custom')}
            />
          </View>
          <View style={[styles.modeDescCard, { borderColor: C.border }]}>
            <Text style={styles.modeDescText}>
              {scooterInfo.rideMode === 'eco'
                ? 'Eco-Modus: Maximale Reichweite, reduzierte Höchstgeschwindigkeit (20 km/h). Ideal für Pendler.'
                : scooterInfo.rideMode === 'sport'
                ? 'Sport-Modus: Maximale Leistung und Beschleunigung. Höchstgeschwindigkeit 25 km/h.'
                : 'Custom-Modus: Benutzerdefinierte Parameter. Einstellungen im Controller-Tab anpassen.'}
            </Text>
          </View>
        </View>

        {/* Live Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live-Daten</Text>
          <View style={[styles.card, { borderColor: C.border }]}>
            <InfoRow label="Aktuelle Geschwindigkeit" value={`${scooterInfo.speed} km/h`} />
            <View style={styles.divider} />
            <InfoRow label="Gesamtkilometer" value={`${scooterInfo.odometer.toFixed(1)} km`} />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8F4FD',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B8CAE',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A2235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B8CAE',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B8CAE',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8F4FD',
    maxWidth: '55%',
    textAlign: 'right',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#00D4FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E3A5F',
    marginHorizontal: 16,
  },
  gaugeContainer: {
    padding: 16,
    gap: 8,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeLabel: {
    fontSize: 14,
    color: '#6B8CAE',
  },
  gaugeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  gaugeTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  tempRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tempCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  tempValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  tempLabel: {
    fontSize: 12,
    color: '#6B8CAE',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeDescCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  modeDescText: {
    fontSize: 13,
    color: '#6B8CAE',
    lineHeight: 19,
  },
  notConnected: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  notConnTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B8CAE',
  },
  notConnDesc: {
    fontSize: 14,
    color: '#6B8CAE',
    textAlign: 'center',
    lineHeight: 20,
  },
});
