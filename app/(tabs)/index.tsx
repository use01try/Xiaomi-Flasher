import React, { useEffect, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Animated, StyleSheet, Platform,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useBle } from '@/context/ble-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
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

function BatteryRing({ level }: { level: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: level / 100, duration: 1200, useNativeDriver: false }).start();
  }, [level]);
  const color = level > 50 ? C.success : level > 20 ? C.warning : C.error;
  return (
    <View style={styles.batteryRingContainer}>
      <View style={[styles.batteryRingOuter, { borderColor: C.border }]}>
        <View style={[styles.batteryRingInner, { borderColor: color }]}>
          <Text style={[styles.batteryPct, { color }]}>{level}%</Text>
          <Text style={styles.batteryLabel}>Akku</Text>
        </View>
      </View>
    </View>
  );
}

function MetricCard({ icon, label, value, unit, color }: {
  icon: string; label: string; value: string | number; unit: string; color: string;
}) {
  return (
    <View style={[styles.metricCard, { borderColor: C.border }]}>
      <IconSymbol name={icon as any} size={22} color={color} />
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, { borderColor: color + '40' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color: C.fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { connectionStatus, connectedDevice, scooterInfo, refreshScooterInfo } = useBle();
  const isConnected = connectionStatus === 'connected';
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isConnected]);

  const handleRefresh = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshScooterInfo();
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Scooter Manager</Text>
            <Text style={styles.headerSub}>Xiaomi Dashboard</Text>
          </View>
          {isConnected && (
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
              <IconSymbol name="arrow.clockwise" size={20} color={C.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Connection Status Card */}
        <View style={[styles.statusCard, { borderColor: isConnected ? C.primary + '60' : C.border }]}>
          <View style={styles.statusRow}>
            <Animated.View style={[
              styles.statusDot,
              { backgroundColor: isConnected ? C.success : connectionStatus === 'connecting' ? C.warning : C.muted },
              isConnected && { transform: [{ scale: pulseAnim }] },
            ]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.statusTitle}>
                {isConnected ? connectedDevice?.name ?? 'Verbunden' :
                  connectionStatus === 'connecting' ? 'Verbinde...' :
                  connectionStatus === 'scanning' ? 'Suche Geräte...' : 'Nicht verbunden'}
              </Text>
              {isConnected && connectedDevice && (
                <Text style={styles.statusSub}>{connectedDevice.mac} · RSSI: {connectedDevice.rssi} dBm</Text>
              )}
              {!isConnected && (
                <Text style={styles.statusSub}>Kein Scooter verbunden</Text>
              )}
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: isConnected ? C.success + '20' : C.muted + '20',
            }]}>
              <Text style={[styles.statusBadgeText, { color: isConnected ? C.success : C.muted }]}>
                {isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {isConnected && scooterInfo ? (
          <>
            {/* Battery Ring + Metrics */}
            <View style={styles.batterySection}>
              <BatteryRing level={scooterInfo.batteryLevel} />
              <View style={styles.metricsGrid}>
                <MetricCard icon="speedometer" label="Geschw." value={scooterInfo.speed} unit="km/h" color={C.primary} />
                <MetricCard icon="thermometer" label="Temperatur" value={scooterInfo.temperature} unit="°C" color={C.warning} />
                <MetricCard icon="bolt.fill" label="Spannung" value={scooterInfo.voltage} unit="V" color={C.success} />
                <MetricCard icon="waveform" label="Motor" value={scooterInfo.motorTemp} unit="°C" color={C.accent} />
              </View>
            </View>

            {/* Ride Mode */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fahrmodus</Text>
              <View style={[styles.rideModeCard, { borderColor: C.border }]}>
                <View style={[styles.rideModeIndicator, {
                  backgroundColor: scooterInfo.rideMode === 'eco' ? C.success :
                    scooterInfo.rideMode === 'sport' ? C.accent : C.primary,
                }]} />
                <Text style={styles.rideModeText}>
                  {scooterInfo.rideMode === 'eco' ? 'Eco-Modus' :
                    scooterInfo.rideMode === 'sport' ? 'Sport-Modus' : 'Custom-Modus'}
                </Text>
                <Text style={styles.rideModeDesc}>
                  {scooterInfo.rideMode === 'eco' ? 'Maximale Reichweite' :
                    scooterInfo.rideMode === 'sport' ? 'Maximale Leistung' : 'Benutzerdefiniert'}
                </Text>
              </View>
            </View>

            {/* Odometer */}
            <View style={[styles.odoCard, { borderColor: C.border }]}>
              <IconSymbol name="map.fill" size={20} color={C.muted} />
              <Text style={styles.odoLabel}>Gesamtkilometer</Text>
              <Text style={styles.odoValue}>{scooterInfo.odometer.toFixed(1)} km</Text>
            </View>
          </>
        ) : (
          /* Not Connected State */
          <View style={styles.emptyState}>
            <IconSymbol name="electric-scooter" size={72} color={C.border} />
            <Text style={styles.emptyTitle}>Kein Scooter verbunden</Text>
            <Text style={styles.emptyDesc}>Verbinde deinen Xiaomi-Scooter über Bluetooth, um Echtzeit-Daten zu sehen.</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schnellzugriff</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="bluetooth"
              label="Scooter suchen"
              color={C.primary}
              onPress={() => router.push('/scanner' as any)}
            />
            <QuickAction
              icon="electric-scooter"
              label="Scooter-Info"
              color={C.success}
              onPress={() => router.push('/info' as any)}
            />
            <QuickAction
              icon="folder.fill"
              label="Firmware"
              color={C.warning}
              onPress={() => router.push('/files' as any)}
            />
            <QuickAction
              icon="wrench.fill"
              label="Controller"
              color={C.accent}
              onPress={() => router.push('/settings' as any)}
            />
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
    letterSpacing: 0.3,
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
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  statusSub: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  batterySection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  batteryRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryRingOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  batteryRingInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0E1A',
  },
  batteryPct: {
    fontSize: 22,
    fontWeight: '700',
  },
  batteryLabel: {
    fontSize: 11,
    color: '#6B8CAE',
    marginTop: 1,
  },
  metricsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 11,
    color: '#6B8CAE',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B8CAE',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B8CAE',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rideModeCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rideModeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rideModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8F4FD',
    flex: 1,
  },
  rideModeDesc: {
    fontSize: 12,
    color: '#6B8CAE',
  },
  odoCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  odoLabel: {
    fontSize: 14,
    color: '#6B8CAE',
    flex: 1,
  },
  odoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8F4FD',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B8CAE',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B8CAE',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
