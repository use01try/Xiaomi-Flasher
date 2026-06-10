import React, { useState, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, Animated, ActivityIndicator,
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

interface FirmwareFile {
  name: string;
  size: number;
  type: 'bin' | 'zip';
  sha256: string;
  valid: boolean;
  version?: string;
}

const MOCK_FILES: FirmwareFile[] = [
  {
    name: 'mi_scooter_3_v1.7.8.bin',
    size: 524288,
    type: 'bin',
    sha256: 'a3f8d2c1e9b047563f2a1d8e4c7b09f2a3d5e6b8c1f4a7d2e9b3c6f0a1d4e7b2',
    valid: true,
    version: '1.7.8',
  },
  {
    name: 'mi_scooter_pro2_firmware.zip',
    size: 1048576,
    type: 'zip',
    sha256: 'b7e3a1d9f2c5e8b4a0d7f3c6e9b2a5d8f1c4e7b0a3d6f9c2e5b8a1d4f7c0e3b6',
    valid: true,
    version: '2.1.3',
  },
  {
    name: 'bootloader_patch.bin',
    size: 65536,
    type: 'bin',
    sha256: 'c1d4e7b0a3f6c9e2b5a8d1f4c7e0b3a6d9f2c5e8b1a4d7f0c3e6b9a2d5f8c1e4',
    valid: false,
    version: undefined,
  },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FileCard({ file, selected, onSelect }: {
  file: FirmwareFile; selected: boolean; onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.fileCard, { borderColor: selected ? C.primary : C.border }]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.fileIcon, { backgroundColor: file.type === 'bin' ? C.primary + '20' : C.warning + '20' }]}>
        <IconSymbol name="doc.fill" size={24} color={file.type === 'bin' ? C.primary : C.warning} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
        <View style={styles.fileMeta}>
          <View style={[styles.fileTypeBadge, { backgroundColor: file.type === 'bin' ? C.primary + '20' : C.warning + '20' }]}>
            <Text style={[styles.fileTypeTxt, { color: file.type === 'bin' ? C.primary : C.warning }]}>
              .{file.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
          {file.version && <Text style={styles.fileVersion}>v{file.version}</Text>}
        </View>
        <View style={styles.fileIntegrity}>
          <IconSymbol
            name={file.valid ? "checkmark.shield.fill" : "xmark.shield.fill"}
            size={14}
            color={file.valid ? C.success : C.error}
          />
          <Text style={[styles.fileIntegrityTxt, { color: file.valid ? C.success : C.error }]}>
            {file.valid ? 'Integrität OK' : 'Integrität fehlgeschlagen'}
          </Text>
        </View>
      </View>
      {selected && (
        <View style={styles.selectedMark}>
          <IconSymbol name="checkmark.circle.fill" size={22} color={C.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function HashRow({ hash }: { hash: string }) {
  return (
    <View style={styles.hashContainer}>
      <Text style={styles.hashLabel}>SHA-256</Text>
      <Text style={styles.hashValue} numberOfLines={2}>{hash}</Text>
    </View>
  );
}

export default function FilesScreen() {
  const { connectionStatus, scooterInfo } = useBle();
  const isConnected = connectionStatus === 'connected';
  const [selectedFile, setSelectedFile] = useState<FirmwareFile | null>(null);
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashState, setFlashState] = useState<'idle' | 'flashing' | 'success' | 'error'>('idle');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleFlash = useCallback(async () => {
    if (!selectedFile || !isConnected) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowConfirm(false);
    setFlashState('flashing');
    setFlashProgress(0);

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 60));
      setFlashProgress(i);
    }

    if (selectedFile.valid) {
      setFlashState('success');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setFlashState('error');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setShowResult(true);
  }, [selectedFile, isConnected]);

  const handlePickFile = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app: DocumentPicker.getDocumentAsync({ type: ['application/octet-stream', 'application/zip'] })
    // For demo, cycle through mock files
    const idx = MOCK_FILES.findIndex(f => f.name === selectedFile?.name);
    setSelectedFile(MOCK_FILES[(idx + 1) % MOCK_FILES.length]);
    setFlashState('idle');
    setFlashProgress(0);
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Firmware-Manager</Text>
          <Text style={styles.headerSub}>Firmware-Dateien verwalten & flashen</Text>
        </View>

        {/* Connection Warning */}
        {!isConnected && (
          <View style={[styles.warnBanner, { borderColor: C.warning + '60' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={C.warning} />
            <Text style={styles.warnText}>Kein Scooter verbunden – Firmware-Flash nicht möglich</Text>
          </View>
        )}

        {/* File Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datei auswählen</Text>
          <TouchableOpacity style={[styles.pickerBtn, { borderColor: C.primary + '60' }]} onPress={handlePickFile} activeOpacity={0.7}>
            <IconSymbol name="doc.badge.plus" size={28} color={C.primary} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.pickerTitle}>Firmware-Datei wählen</Text>
              <Text style={styles.pickerSub}>Unterstützte Formate: .bin, .zip</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Selected File Details */}
        {selectedFile && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ausgewählte Datei</Text>
              <View style={[styles.card, { borderColor: selectedFile.valid ? C.primary + '40' : C.error + '40' }]}>
                <View style={styles.selectedFileHeader}>
                  <View style={[styles.fileIcon, { backgroundColor: selectedFile.type === 'bin' ? C.primary + '20' : C.warning + '20' }]}>
                    <IconSymbol name="doc.fill" size={28} color={selectedFile.type === 'bin' ? C.primary : C.warning} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                    <Text style={styles.selectedFileMeta}>
                      {formatSize(selectedFile.size)} · .{selectedFile.type.toUpperCase()}
                      {selectedFile.version ? ` · v${selectedFile.version}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <HashRow hash={selectedFile.sha256} />
                <View style={styles.divider} />
                <View style={styles.integrityRow}>
                  <IconSymbol
                    name={selectedFile.valid ? "checkmark.shield.fill" : "xmark.shield.fill"}
                    size={20}
                    color={selectedFile.valid ? C.success : C.error}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.integrityTitle, { color: selectedFile.valid ? C.success : C.error }]}>
                      {selectedFile.valid ? 'Integritätsprüfung bestanden' : 'Integritätsprüfung fehlgeschlagen'}
                    </Text>
                    <Text style={styles.integrityDesc}>
                      {selectedFile.valid
                        ? 'SHA-256 Hash verifiziert. Datei ist unverändert.'
                        : 'Hash stimmt nicht überein. Datei möglicherweise beschädigt.'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Flash Progress */}
            {flashState === 'flashing' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Flash-Fortschritt</Text>
                <View style={[styles.card, { borderColor: C.primary + '40' }]}>
                  <View style={styles.flashHeader}>
                    <ActivityIndicator size="small" color={C.primary} />
                    <Text style={styles.flashTitle}>Firmware wird geschrieben...</Text>
                    <Text style={[styles.flashPct, { color: C.primary }]}>{flashProgress}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: `${flashProgress}%` as any }]} />
                  </View>
                  <Text style={styles.flashSub}>Bitte Scooter nicht ausschalten oder trennen</Text>
                </View>
              </View>
            )}

            {/* Flash Button */}
            {flashState === 'idle' && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={[
                    styles.flashBtn,
                    { borderColor: !isConnected || !selectedFile.valid ? C.muted : C.primary },
                    (!isConnected || !selectedFile.valid) && styles.flashBtnDisabled,
                  ]}
                  onPress={() => setShowConfirm(true)}
                  disabled={!isConnected || !selectedFile.valid}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="arrow.up.doc.fill" size={22} color={!isConnected || !selectedFile.valid ? C.muted : C.primary} />
                  <Text style={[styles.flashBtnText, { color: !isConnected || !selectedFile.valid ? C.muted : C.primary }]}>
                    Firmware schreiben
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* File Library */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firmware-Bibliothek</Text>
          <View style={{ gap: 10 }}>
            {MOCK_FILES.map(file => (
              <FileCard
                key={file.name}
                file={file}
                selected={selectedFile?.name === file.name}
                onSelect={() => { setSelectedFile(file); setFlashState('idle'); setFlashProgress(0); }}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: C.warning + '20' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color={C.warning} />
            </View>
            <Text style={styles.modalTitle}>Firmware flashen?</Text>
            <Text style={styles.modalMsg}>
              Du bist dabei, {selectedFile?.name} auf deinen Scooter zu schreiben.{'\n\n'}
              Dieser Vorgang kann nicht rückgängig gemacht werden. Stelle sicher, dass der Akku mindestens 50% hat.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: C.border }]} onPress={() => setShowConfirm(false)}>
                <Text style={[styles.modalBtnText, { color: C.muted }]}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: C.warning, backgroundColor: C.warning + '20' }]} onPress={handleFlash}>
                <Text style={[styles.modalBtnText, { color: C.warning }]}>Flashen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: flashState === 'success' ? C.success + '20' : C.error + '20' }]}>
              <IconSymbol
                name={flashState === 'success' ? "checkmark.circle.fill" : "xmark.circle.fill"}
                size={32}
                color={flashState === 'success' ? C.success : C.error}
              />
            </View>
            <Text style={styles.modalTitle}>
              {flashState === 'success' ? 'Flash erfolgreich!' : 'Flash fehlgeschlagen'}
            </Text>
            <Text style={styles.modalMsg}>
              {flashState === 'success'
                ? `Firmware ${selectedFile?.version ? `v${selectedFile.version}` : ''} wurde erfolgreich auf den Scooter geschrieben. Bitte starte den Scooter neu.`
                : 'Der Flash-Vorgang ist fehlgeschlagen. Bitte überprüfe die Dateiintegrität und versuche es erneut.'}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { borderColor: flashState === 'success' ? C.success : C.error, backgroundColor: flashState === 'success' ? C.success + '20' : C.error + '20', width: '100%', justifyContent: 'center' }]}
              onPress={() => { setShowResult(false); setFlashState('idle'); }}
            >
              <Text style={[styles.modalBtnText, { color: flashState === 'success' ? C.success : C.error }]}>OK</Text>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B8CAE',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  warnBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFB30010',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warnText: {
    fontSize: 12,
    color: '#FFB300',
    flex: 1,
    lineHeight: 17,
  },
  pickerBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  pickerSub: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  selectedFileMeta: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E3A5F',
    marginHorizontal: 16,
  },
  hashContainer: {
    padding: 16,
    gap: 6,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B8CAE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hashValue: {
    fontSize: 11,
    color: '#00D4FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  integrityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  integrityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  integrityDesc: {
    fontSize: 12,
    color: '#6B8CAE',
    marginTop: 2,
    lineHeight: 17,
  },
  flashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  flashTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F4FD',
    flex: 1,
  },
  flashPct: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1E3A5F',
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 3,
  },
  flashSub: {
    fontSize: 12,
    color: '#6B8CAE',
    textAlign: 'center',
    padding: 12,
  },
  flashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#111827',
  },
  flashBtnDisabled: {
    opacity: 0.5,
  },
  flashBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  fileCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8F4FD',
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  fileTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fileTypeTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B8CAE',
  },
  fileVersion: {
    fontSize: 12,
    color: '#6B8CAE',
  },
  fileIntegrity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  fileIntegrityTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedMark: {
    marginLeft: 8,
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
