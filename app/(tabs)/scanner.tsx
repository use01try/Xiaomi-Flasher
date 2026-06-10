import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  Animated, Modal, Platform, ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useBle, BleDevice } from '@/context/ble-context';
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

function RssiBar({ rssi }: { rssi: number }) {
  const bars = rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
  const color = bars === 4 ? C.success : bars === 3 ? C.primary : bars === 2 ? C.warning : C.error;
  return (
    <View style={styles.rssiContainer}>
      {[1, 2, 3, 4].map(b => (
        <View
          key={b}
          style={[
            styles.rssiBar,
            { height: 4 + b * 4, backgroundColor: b <= bars ? color : C.border },
          ]}
        />
      ))}
    </View>
  );
}

function DeviceItem({ device, onConnect, isConnecting }: {
  device: BleDevice;
  onConnect: (d: BleDevice) => void;
  isConnecting: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.deviceCard, { opacity: fadeAnim, borderColor: device.isXiaomi ? C.primary + '40' : C.border }]}>
      <View style={[styles.deviceIcon, { backgroundColor: device.isXiaomi ? C.primary + '20' : C.muted + '20' }]}>
        <IconSymbol name="bluetooth" size={22} color={device.isXiaomi ? C.primary : C.muted} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.deviceNameRow}>
          <Text style={styles.deviceName}>{device.name}</Text>
          {device.isXiaomi && (
            <View style={styles.xiaomiBadge}>
              <Text style={styles.xiaomiBadgeText}>Xiaomi</Text>
            </View>
          )}
        </View>
        <Text style={styles.deviceMac}>{device.mac}</Text>
        <View style={styles.deviceRssiRow}>
          <RssiBar rssi={device.rssi} />
          <Text style={styles.deviceRssiText}>{device.rssi} dBm</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.connectBtn, { borderColor: device.isXiaomi ? C.primary : C.muted }]}
        onPress={() => onConnect(device)}
        disabled={isConnecting}
        activeOpacity={0.7}
      >
        {isConnecting ? (
          <ActivityIndicator size="small" color={C.primary} />
        ) : (
          <Text style={[styles.connectBtnText, { color: device.isXiaomi ? C.primary : C.muted }]}>
            Verbinden
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ScannerScreen() {
  const { isScanning, scannedDevices, startScan, stopScan, connectToDevice, connectionStatus, errorMessage, clearError } = useBle();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      );
      pulse.start();
      rotate.start();
      return () => { pulse.stop(); rotate.stop(); };
    }
  }, [isScanning]);

  const handleScan = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isScanning) stopScan();
    else startScan();
  };

  const handleConnect = async (device: BleDevice) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConnectingId(device.id);
    await connectToDevice(device);
    setConnectingId(null);
  };

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLE Scanner</Text>
        <Text style={styles.headerSub}>Bluetooth Low Energy Gerätesuche</Text>
      </View>

      {/* Permissions Banner */}
      <View style={[styles.permBanner, { borderColor: C.primary + '40' }]}>
        <IconSymbol name="info.circle.fill" size={18} color={C.primary} />
        <Text style={styles.permText}>
          Bluetooth & Standort-Berechtigung erforderlich für BLE-Scan
        </Text>
      </View>

      {/* Scan Button */}
      <View style={styles.scanBtnContainer}>
        <TouchableOpacity
          style={[styles.scanBtn, { borderColor: isScanning ? C.error : C.primary }]}
          onPress={handleScan}
          activeOpacity={0.8}
        >
          <Animated.View style={isScanning ? { transform: [{ rotate: spin }] } : {}}>
            <IconSymbol
              name={isScanning ? "arrow.triangle.2.circlepath" : "magnifyingglass"}
              size={28}
              color={isScanning ? C.error : C.primary}
            />
          </Animated.View>
          <Text style={[styles.scanBtnText, { color: isScanning ? C.error : C.primary }]}>
            {isScanning ? 'Scan stoppen' : 'Scooter suchen'}
          </Text>
        </TouchableOpacity>

        {isScanning && (
          <View style={styles.scanStatus}>
            <Animated.View style={[styles.scanDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.scanStatusText}>
              Suche läuft... {scannedDevices.length} Gerät{scannedDevices.length !== 1 ? 'e' : ''} gefunden
            </Text>
          </View>
        )}
      </View>

      {/* Device List */}
      {scannedDevices.length > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Gefundene Geräte</Text>
          <Text style={styles.listCount}>{scannedDevices.length}</Text>
        </View>
      )}

      <FlatList
        data={scannedDevices}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}
        renderItem={({ item }) => (
          <DeviceItem
            device={item}
            onConnect={handleConnect}
            isConnecting={connectingId === item.id}
          />
        )}
        ListEmptyComponent={
          !isScanning ? (
            <View style={styles.emptyState}>
              <IconSymbol name="bluetooth" size={64} color={C.border} />
              <Text style={styles.emptyTitle}>Keine Geräte</Text>
              <Text style={styles.emptyDesc}>Tippe auf "Scooter suchen" um den BLE-Scan zu starten.</Text>
            </View>
          ) : null
        }
      />

      {/* Error Modal */}
      <Modal visible={!!errorMessage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color={C.error} />
            </View>
            <Text style={styles.modalTitle}>Verbindungsfehler</Text>
            <Text style={styles.modalMsg}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={clearError}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={connectionStatus === 'connected' && !errorMessage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: C.success + '20' }]}>
              <IconSymbol name="checkmark.circle.fill" size={32} color={C.success} />
            </View>
            <Text style={styles.modalTitle}>Verbunden!</Text>
            <Text style={styles.modalMsg}>Scooter erfolgreich verbunden. Du kannst jetzt alle Funktionen nutzen.</Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: C.success }]} onPress={() => {}}>
              <Text style={[styles.modalBtnText, { color: C.bg }]}>Zum Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
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
  permBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#00D4FF10',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permText: {
    fontSize: 12,
    color: '#6B8CAE',
    flex: 1,
    lineHeight: 17,
  },
  scanBtnContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: '#111827',
  },
  scanBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4FF',
  },
  scanStatusText: {
    fontSize: 13,
    color: '#6B8CAE',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B8CAE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  listCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D4FF',
    backgroundColor: '#00D4FF20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deviceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  xiaomiBadge: {
    backgroundColor: '#00D4FF20',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  xiaomiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D4FF',
  },
  deviceMac: {
    fontSize: 11,
    color: '#6B8CAE',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  deviceRssiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rssiContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  rssiBar: {
    width: 4,
    borderRadius: 2,
  },
  deviceRssiText: {
    fontSize: 11,
    color: '#6B8CAE',
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  connectBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B8CAE',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B8CAE',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF174420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8F4FD',
  },
  modalMsg: {
    fontSize: 14,
    color: '#6B8CAE',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBtn: {
    backgroundColor: '#FF174420',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF1744',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF1744',
  },
});
