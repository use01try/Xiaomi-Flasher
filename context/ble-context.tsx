import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface BleDevice {
  id: string;
  name: string;
  mac: string;
  rssi: number;
  isXiaomi: boolean;
}

export interface ScooterInfo {
  serialNumber: string;
  modelName: string;
  firmwareVersion: string;
  batteryLevel: number;
  temperature: number;
  voltage: number;
  rideMode: 'eco' | 'sport' | 'custom';
  speed: number;
  odometer: number;
  motorTemp: number;
}

export interface BleContextType {
  connectionStatus: ConnectionStatus;
  connectedDevice: BleDevice | null;
  scannedDevices: BleDevice[];
  scooterInfo: ScooterInfo | null;
  isScanning: boolean;
  errorMessage: string | null;
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (device: BleDevice) => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
  refreshScooterInfo: () => void;
  setRideMode: (mode: 'eco' | 'sport' | 'custom') => void;
  autoReconnect: boolean;
  setAutoReconnect: (val: boolean) => void;
}

const BleContext = createContext<BleContextType | null>(null);

const MOCK_DEVICES: BleDevice[] = [
  { id: '1', name: 'Mi Electric Scooter 3', mac: 'AA:BB:CC:DD:EE:01', rssi: -52, isXiaomi: true },
  { id: '2', name: 'Mi Scooter Pro 2', mac: 'AA:BB:CC:DD:EE:02', rssi: -67, isXiaomi: true },
  { id: '3', name: 'Xiaomi Scooter 4 Ultra', mac: 'AA:BB:CC:DD:EE:03', rssi: -75, isXiaomi: true },
  { id: '4', name: 'Unknown BLE Device', mac: 'FF:EE:DD:CC:BB:04', rssi: -88, isXiaomi: false },
];

const MOCK_SCOOTER_INFO: ScooterInfo = {
  serialNumber: 'XM3-2024-001337',
  modelName: 'Mi Electric Scooter 3',
  firmwareVersion: '1.7.6',
  batteryLevel: 78,
  temperature: 32,
  voltage: 41.8,
  rideMode: 'sport',
  speed: 0,
  odometer: 1247.3,
  motorTemp: 38,
};

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | null>(null);
  const [scannedDevices, setScannedDevices] = useState<BleDevice[]>([]);
  const [scooterInfo, setScooterInfo] = useState<ScooterInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = useCallback(() => {
    setIsScanning(true);
    setConnectionStatus('scanning');
    setScannedDevices([]);

    // Simulate progressive device discovery
    let idx = 0;
    const addDevice = () => {
      if (idx < MOCK_DEVICES.length) {
        setScannedDevices(prev => [...prev, MOCK_DEVICES[idx]]);
        idx++;
        scanTimerRef.current = setTimeout(addDevice, 600 + Math.random() * 400);
      } else {
        setIsScanning(false);
        setConnectionStatus('disconnected');
      }
    };
    scanTimerRef.current = setTimeout(addDevice, 500);
  }, []);

  const stopScan = useCallback(() => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    setIsScanning(false);
    setConnectionStatus('disconnected');
  }, []);

  const connectToDevice = useCallback(async (device: BleDevice) => {
    setConnectionStatus('connecting');
    setErrorMessage(null);
    await new Promise(r => setTimeout(r, 1800));

    if (device.rssi < -85) {
      setConnectionStatus('error');
      setErrorMessage(`Verbindung zu "${device.name}" fehlgeschlagen. Signal zu schwach (RSSI: ${device.rssi} dBm). Bitte näher herantreten.`);
      return;
    }

    setConnectedDevice(device);
    setConnectionStatus('connected');
    setScooterInfo({ ...MOCK_SCOOTER_INFO, modelName: device.name });
  }, []);

  const disconnect = useCallback(() => {
    setConnectedDevice(null);
    setConnectionStatus('disconnected');
    setScooterInfo(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setConnectionStatus('disconnected');
  }, []);

  const refreshScooterInfo = useCallback(() => {
    if (!scooterInfo) return;
    setScooterInfo(prev => prev ? {
      ...prev,
      batteryLevel: Math.max(0, Math.min(100, prev.batteryLevel + Math.floor(Math.random() * 3 - 1))),
      temperature: 30 + Math.floor(Math.random() * 10),
      voltage: parseFloat((41 + Math.random() * 2).toFixed(1)),
      speed: Math.floor(Math.random() * 25),
      motorTemp: 35 + Math.floor(Math.random() * 10),
    } : null);
  }, [scooterInfo]);

  const setRideMode = useCallback((mode: 'eco' | 'sport' | 'custom') => {
    setScooterInfo(prev => prev ? { ...prev, rideMode: mode } : null);
  }, []);

  return (
    <BleContext.Provider value={{
      connectionStatus,
      connectedDevice,
      scannedDevices,
      scooterInfo,
      isScanning,
      errorMessage,
      startScan,
      stopScan,
      connectToDevice,
      disconnect,
      clearError,
      refreshScooterInfo,
      setRideMode,
      autoReconnect,
      setAutoReconnect,
    }}>
      {children}
    </BleContext.Provider>
  );
}

export function useBle() {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error('useBle must be used within BleProvider');
  return ctx;
}
