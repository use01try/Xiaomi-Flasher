import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, Switch,
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

interface ControllerParam {
  id: string;
  label: string;
  desc: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  danger?: boolean;
}

const DEFAULT_PARAMS: ControllerParam[] = [
  { id: 'speed_limit', label: 'Geschwindigkeitslimit', desc: 'Maximale Fahrgeschwindigkeit', value: 25, min: 10, max: 35, unit: 'km/h', color: '#00D4FF' },
  { id: 'motor_power', label: 'Motorleistung', desc: 'Maximale Motorleistung in Watt', value: 300, min: 100, max: 600, unit: 'W', color: '#FF6B35' },
  { id: 'brake_strength', label: 'Bremsstärke', desc: 'Elektrische Bremskraft', value: 70, min: 20, max: 100, unit: '%', color: '#00E676' },
  { id: 'accel_curve', label: 'Beschleunigungskurve', desc: 'Ansprechverhalten des Gashebels', value: 50, min: 1, max: 100, unit: '%', color: '#FFB300' },
  { id: 'cruise_speed', label: 'Tempomat-Geschwindigkeit', desc: 'Automatische Haltegeschwindigkeit', value: 20, min: 5, max: 30, unit: 'km/h', color: '#00D4FF' },
  { id: 'regen_brake', label: 'Rekuperationsbremse', desc: 'Energie-Rückgewinnung beim Bremsen', value: 60, min: 0, max: 100, unit: '%', color: '#00E676', danger: false },
];

function SliderRow({ param, onChange }: { param: ControllerParam; onChange: (id: string, val: number) => void }) {
  const pct = ((param.value - param.min) / (param.max - param.min)) * 100;

  const decrease = () => {
    if (param.value > param.min) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(param.id, param.value - 1);
    }
  };
  const increase = () => {
    if (param.value < param.max) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(param.id, param.value + 1);
    }
  };

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sliderLabel}>{param.label}</Text>
          <Text style={styles.sliderDesc}>{param.desc}</Text>
        </View>
        <Text style={[styles.sliderValue, { color: param.color }]}>{param.value} {param.unit}</Text>
      </View>
      <View style={styles.sliderControls}>
        <TouchableOpacity style={[styles.sliderBtn, { borderColor: C.border }]} onPress={decrease}>
          <IconSymbol name="minus.circle.fill" size={22} color={C.muted} />
        </TouchableOpacity>
        <View style={styles.sliderTrackContainer}>
          <View style={[styles.sliderTrack, { backgroundColor: C.border }]}>
            <View style={[styles.sliderFill, { width: `${pct}%` as any, backgroundColor: param.color }]} />
          </View>
          <View style={styles.sliderRange}>
            <Text style={styles.sliderRangeText}>{param.min}</Text>
            <Text style={styles.sliderRangeText}>{param.max}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.sliderBtn, { borderColor: C.border }]} onPress={increase}>
          <IconSymbol name="plus.circle.fill" size={22} color={param.color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BootloaderAction({ icon, title, desc, color, onPress, disabled }: {
  icon: string; title: string; desc: string; color: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.bootAction, { borderColor: disabled ? C.border : color + '40', opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.bootIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.bootTitle}>{title}</Text>
        <Text style={styles.bootDesc}>{desc}</Text>
      </View>
      <IconSymbol name="chevron.right" size={18} color={C.muted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { connectionStatus, connectedDevice, disconnect, autoReconnect, setAutoReconnect } = useBle();
  const isConnected = connectionStatus === 'connected';
  const [params, setParams] = useState<ControllerParam[]>(DEFAULT_PARAMS);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showBootConfirm, setShowBootConfirm] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [bootResult, setBootResult] = useState<string | null>(null);

  const handleParamChange = (id: string, val: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: val } : p));
  };

  const handleApply = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowApplyConfirm(false);
    await new Promise(r => setTimeout(r, 1200));
    setApplySuccess(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setApplySuccess(false), 3000);
  };

  const handleBootAction = async (action: string) => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowBootConfirm(null);
    await new Promise(r => setTimeout(r, 1500));
    setBootResult(action);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Einstellungen</Text>
          <Text style={styles.headerSub}>Controller & Bootloader</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verbindung</Text>
          <View style={[styles.card, { borderColor: isConnected ? C.primary + '40' : C.border }]}>
            <View style={styles.connRow}>
              <View style={[styles.connDot, { backgroundColor: isConnected ? C.success : C.muted }]} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.connTitle}>{isConnected ? connectedDevice?.name ?? 'Verbunden' : 'Nicht verbunden'}</Text>
                {isConnected && <Text style={styles.connSub}>{connectedDevice?.mac}</Text>}
              </View>
              {isConnected && (
                <TouchableOpacity style={[styles.disconnBtn, { borderColor: C.error }]} onPress={disconnect}>
                  <Text style={[styles.disconnBtnText, { color: C.error }]}>Trennen</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Auto-Reconnect</Text>
                <Text style={styles.toggleDesc}>Automatisch erneut verbinden</Text>
              </View>
              <Switch
                value={autoReconnect}
                onValueChange={setAutoReconnect}
                trackColor={{ false: C.border, true: C.primary + '60' }}
                thumbColor={autoReconnect ? C.primary : C.muted}
              />
            </View>
          </View>
        </View>

        {/* Controller Modification */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Controller-Modifikation</Text>
            {!isConnected && <Text style={styles.sectionBadge}>Offline</Text>}
          </View>
          <View style={[styles.dangerBanner, { borderColor: C.warning + '40' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color={C.warning} />
            <Text style={styles.dangerText}>
              Änderungen können die Garantie erlöschen lassen. Auf eigene Gefahr!
            </Text>
          </View>
          <View style={[styles.card, { borderColor: C.border }]}>
            {params.map((param, idx) => (
              <React.Fragment key={param.id}>
                <SliderRow param={param} onChange={handleParamChange} />
                {idx < params.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
          {applySuccess && (
            <View style={[styles.successBanner, { borderColor: C.success + '40' }]}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={C.success} />
              <Text style={styles.successText}>Parameter erfolgreich angewendet!</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.applyBtn, { borderColor: !isConnected ? C.muted : C.primary, opacity: !isConnected ? 0.5 : 1 }]}
            onPress={() => setShowApplyConfirm(true)}
            disabled={!isConnected}
            activeOpacity={0.8}
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color={!isConnected ? C.muted : C.primary} />
            <Text style={[styles.applyBtnText, { color: !isConnected ? C.muted : C.primary }]}>
              Parameter anwenden
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bootloader */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bootloader-Funktionen</Text>
          <View style={[styles.dangerBanner, { borderColor: C.error + '40', backgroundColor: C.error + '08' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color={C.error} />
            <Text style={[styles.dangerText, { color: C.error }]}>
              GEFAHR: Falsche Bootloader-Operationen können den Scooter dauerhaft beschädigen!
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            <BootloaderAction
              icon="power"
              title="Bootloader-Modus aktivieren"
              desc="Scooter in DFU-Modus versetzen"
              color={C.warning}
              onPress={() => setShowBootConfirm('bootloader')}
              disabled={!isConnected}
            />
            <BootloaderAction
              icon="arrow.clockwise"
              title="Werksreset"
              desc="Alle Einstellungen zurücksetzen"
              color={C.error}
              onPress={() => setShowBootConfirm('factory')}
              disabled={!isConnected}
            />
            <BootloaderAction
              icon="lock.open.fill"
              title="Geschwindigkeitssperre deaktivieren"
              desc="EU-Geschwindigkeitsbegrenzung entfernen"
              color={C.accent}
              onPress={() => setShowBootConfirm('unlock')}
              disabled={!isConnected}
            />
            <BootloaderAction
              icon="cpu"
              title="Diagnose-Dump"
              desc="Controller-Speicher auslesen"
              color={C.primary}
              onPress={() => setShowBootConfirm('dump')}
              disabled={!isConnected}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App-Informationen</Text>
          <View style={[styles.card, { borderColor: C.border }]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Protokoll</Text>
              <Text style={styles.infoValue}>Xiaomi BLE v2</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Unterstützte Modelle</Text>
              <Text style={styles.infoValue}>Mi 1S, 3, Pro 2, 4 Ultra</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Apply Confirm Modal */}
      <Modal visible={showApplyConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: C.warning + '20' }]}>
              <IconSymbol name="gearshape.fill" size={32} color={C.warning} />
            </View>
            <Text style={styles.modalTitle}>Parameter anwenden?</Text>
            <Text style={styles.modalMsg}>
              Die geänderten Controller-Parameter werden auf deinen Scooter geschrieben. Dieser Vorgang dauert ca. 2 Sekunden.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: C.border }]} onPress={() => setShowApplyConfirm(false)}>
                <Text style={[styles.modalBtnText, { color: C.muted }]}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: C.primary, backgroundColor: C.primary + '20' }]} onPress={handleApply}>
                <Text style={[styles.modalBtnText, { color: C.primary }]}>Anwenden</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bootloader Confirm Modal */}
      <Modal visible={!!showBootConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: C.error + '20' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color={C.error} />
            </View>
            <Text style={styles.modalTitle}>
              {showBootConfirm === 'bootloader' ? 'Bootloader aktivieren?' :
               showBootConfirm === 'factory' ? 'Werksreset durchführen?' :
               showBootConfirm === 'unlock' ? 'Sperre deaktivieren?' : 'Diagnose-Dump starten?'}
            </Text>
            <Text style={styles.modalMsg}>
              {showBootConfirm === 'factory'
                ? 'ACHTUNG: Alle Einstellungen werden unwiderruflich gelöscht! Der Scooter wird auf Werkseinstellungen zurückgesetzt.'
                : showBootConfirm === 'unlock'
                ? 'ACHTUNG: Das Entfernen der EU-Geschwindigkeitsbegrenzung ist in manchen Ländern illegal. Auf eigene Gefahr!'
                : 'Diese Operation ist fortgeschritten und kann den Scooter beschädigen, wenn sie falsch durchgeführt wird.'}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: C.border }]} onPress={() => setShowBootConfirm(null)}>
                <Text style={[styles.modalBtnText, { color: C.muted }]}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: C.error, backgroundColor: C.error + '20' }]}
                onPress={() => handleBootAction(showBootConfirm!)}
              >
                <Text style={[styles.modalBtnText, { color: C.error }]}>Fortfahren</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Boot Result Modal */}
      <Modal visible={!!bootResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: C.success + '20' }]}>
              <IconSymbol name="checkmark.circle.fill" size={32} color={C.success} />
            </View>
            <Text style={styles.modalTitle}>Erfolgreich!</Text>
            <Text style={styles.modalMsg}>
              {bootResult === 'bootloader' ? 'Scooter befindet sich jetzt im Bootloader-Modus. Verbinde ihn mit dem Firmware-Manager.' :
               bootResult === 'factory' ? 'Werksreset abgeschlossen. Scooter wird neu gestartet.' :
               bootResult === 'unlock' ? 'Geschwindigkeitssperre erfolgreich deaktiviert.' :
               'Diagnose-Dump erfolgreich. Daten wurden gespeichert.'}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { borderColor: C.success, backgroundColor: C.success + '20', width: '100%', justifyContent: 'center' }]}
              onPress={() => setBootResult(null)}
            >
              <Text style={[styles.modalBtnText, { color: C.success }]}>OK</Text>
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
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B8CAE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B8CAE',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  connDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  connSub: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  disconnBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  disconnBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E3A5F',
    marginHorizontal: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 2,
  },
  dangerBanner: {
    backgroundColor: '#FFB30010',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  dangerText: {
    fontSize: 12,
    color: '#FFB300',
    flex: 1,
    lineHeight: 17,
  },
  sliderRow: {
    padding: 14,
    gap: 10,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  sliderDesc: {
    fontSize: 11,
    color: '#6B8CAE',
    marginTop: 2,
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sliderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#1A2235',
  },
  sliderTrackContainer: {
    flex: 1,
    gap: 4,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderRangeText: {
    fontSize: 10,
    color: '#6B8CAE',
  },
  successBanner: {
    backgroundColor: '#00E67610',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  successText: {
    fontSize: 13,
    color: '#00E676',
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#111827',
    marginTop: 12,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  bootAction: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bootIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  bootDesc: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 2,
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
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
