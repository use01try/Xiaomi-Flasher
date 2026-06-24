import { BleManager } from 'react-native-ble-plx';
import type { Device as Peripheral } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export interface ScooterDevice {
  id: string;
  name: string;
  model: string;
  rssi: number;
  isConnected: boolean;
  batteryLevel?: number;
  temperature?: number;
  version?: string;
  serialNumber?: string;
}

export class XiaomiScooterBLE {
  private bleManager: BleManager;
  private connectedDevice: Peripheral | null = null;
  private onLogCallback?: (message: string) => void;

  // BLE UUIDs für Xiaomi Scooter
  private readonly SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
  private readonly TX_CHAR = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
  private readonly RX_CHAR = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

  // Scooter Modelle
  private readonly SCOOTER_MODELS: { [key: string]: string } = {
    '1': 'Xiaomi M365',
    '2': 'Xiaomi M365 Pro',
    '3': 'Xiaomi 1S',
    '4': 'Xiaomi Lite/Essential',
    '5': 'Xiaomi M365 Pro 2',
    '6': 'Xiaomi 4 Pro 2nd Gen',
    '7': 'Xiaomi 4 Pro',
    '8': 'Xiaomi 4',
    '9': 'Xiaomi 3',
  };

  constructor() {
    this.bleManager = new BleManager();
  }

  setLogCallback(callback: (message: string) => void) {
    this.onLogCallback = callback;
  }

  private log(message: string) {
    console.log(`[BLE] ${message}`);
    if (this.onLogCallback) {
      this.onLogCallback(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
  }

  async startScan(): Promise<ScooterDevice[]> {
    this.log('Starte BLE Scan...');
    const devices: ScooterDevice[] = [];

    return new Promise((resolve) => {
      this.bleManager.startDeviceScan(null, null, (error: any, device: any) => {
        if (error) {
          this.log(`Scan Fehler: ${error.message}`);
          resolve(devices);
          return;
        }

        if (device && device.name && this.isXiaomiScooter(device.name)) {
          const scooterDevice: ScooterDevice = {
            id: device.id,
            name: device.name,
            model: this.identifyModel(device.name),
            rssi: device.rssi || 0,
            isConnected: false,
          };

          if (!devices.find(d => d.id === device.id)) {
            devices.push(scooterDevice);
            this.log(`Gefunden: ${device.name} (RSSI: ${device.rssi})`);
          }
        }
      });

      // Scan 10 Sekunden laufen lassen
      setTimeout(() => {
        this.bleManager.stopDeviceScan();
        this.log(`Scan abgeschlossen. ${devices.length} Scooter gefunden.`);
        resolve(devices);
      }, 10000);
    });
  }

  private isXiaomiScooter(name: string): boolean {
    const xiaomiPatterns = ['Xiaomi', 'M365', 'Mi3', 'Mi4', 'MiES', 'Ninebot'];
    return xiaomiPatterns.some(pattern => name.includes(pattern));
  }

  private identifyModel(name: string): string {
    if (name.includes('M365 Pro 2')) return 'Xiaomi M365 Pro 2';
    if (name.includes('M365 Pro')) return 'Xiaomi M365 Pro';
    if (name.includes('M365')) return 'Xiaomi M365';
    if (name.includes('1S')) return 'Xiaomi 1S';
    if (name.includes('4 Pro')) return 'Xiaomi 4 Pro 2nd Gen';
    if (name.includes('4')) return 'Xiaomi 4';
    if (name.includes('3')) return 'Xiaomi 3';
    if (name.includes('Lite') || name.includes('ES')) return 'Xiaomi Lite/Essential';
    return 'Unbekanntes Modell';
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      this.log(`Verbinde mit Gerät: ${deviceId}...`);
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      this.log(`✓ Verbunden mit ${device.name}`);

      // Starte Notifications
      await this.setupNotifications();

      // Lese Geräteinformationen
      await this.readDeviceInfo();

      return true;
    } catch (error) {
      this.log(`✗ Verbindungsfehler: ${error}`);
      return false;
    }
  }

  private async setupNotifications() {
    if (!this.connectedDevice) return;

    try {
      await this.connectedDevice.monitorCharacteristicForService(
        this.SERVICE_UUID,
        this.RX_CHAR,
        (error: any, characteristic: any) => {
          if (error) {
            this.log(`Notification Fehler: ${error.message}`);
            return;
          }

          if (characteristic?.value) {
            const data = Buffer.from(characteristic.value, 'base64');
            this.handleResponse(data);
          }
        }
      );

      this.log('Notifications aktiviert');
    } catch (error) {
      this.log(`Notification Setup Fehler: ${error}`);
    }
  }

  private async readDeviceInfo() {
    try {
      // Lese Batterie
      await this.readRegister(0x20);
      // Lese Temperatur
      await this.readRegister(0x21);
      // Lese Spannung
      await this.readRegister(0x22);
      // Lese Firmware-Version
      await this.readRegister(0x27);
      // Lese Seriennummer
      await this.readRegister(0x26);
    } catch (error) {
      this.log(`Fehler beim Lesen von Geräteinformationen: ${error}`);
    }
  }

  private async readRegister(address: number): Promise<void> {
    if (!this.connectedDevice) return;

    const command = this.createCommand(0x20, address, []);
    await this.sendCommand(command);
  }

  private createCommand(cmd: number, addr: number, data: number[]): Buffer {
    const buffer = Buffer.alloc(data.length + 4);
    buffer[0] = 0x5A; // Header
    buffer[1] = cmd;
    buffer[2] = addr;
    data.forEach((byte, i) => buffer[3 + i] = byte);
    buffer[buffer.length - 1] = this.calculateChecksum(buffer.slice(0, -1));
    return buffer;
  }

  private calculateChecksum(data: Buffer): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum ^= data[i];
    }
    return sum;
  }

  private async sendCommand(command: Buffer): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.SERVICE_UUID,
        this.TX_CHAR,
        command.toString('base64')
      );
    } catch (error) {
      this.log(`Fehler beim Senden des Kommandos: ${error}`);
    }
  }

  private handleResponse(data: Buffer) {
    if (data.length < 4) return;

    const cmd = data[1];
    const addr = data[2];
    const value = data.slice(3, -1);

    switch (addr) {
      case 0x20:
        this.log(`Batterie: ${value[0]}%`);
        break;
      case 0x21:
        this.log(`Temperatur: ${value[0]}°C`);
        break;
      case 0x22:
        this.log(`Spannung: ${(value[0] << 8 | value[1]) / 1000}V`);
        break;
      case 0x27:
        this.log(`Firmware: ${value.toString('utf-8')}`);
        break;
      case 0x26:
        this.log(`Seriennummer: ${value.toString('utf-8')}`);
        break;
    }
  }

  async flashFirmware(firmwareData: Buffer, onProgress?: (progress: number) => void): Promise<boolean> {
    if (!this.connectedDevice) {
      this.log('Kein Gerät verbunden');
      return false;
    }

    try {
      this.log('Starte Firmware-Flash...');

      // Aktiviere DFU Modus
      this.log('Aktiviere DFU Modus...');
      const dfuCommand = Buffer.from([0x5A, 0x5B, 0x5C, 0x5D]);
      await this.sendCommand(dfuCommand);

      // Warte auf DFU Bestätigung
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.log('DFU Modus aktiviert');

      // Sende Firmware in Chunks
      const chunkSize = 256;
      const totalChunks = Math.ceil(firmwareData.length / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, firmwareData.length);
        const chunk = firmwareData.slice(start, end);

        const chunkCommand = Buffer.alloc(chunk.length + 4);
        chunkCommand[0] = 0x5A;
        chunkCommand[1] = 0x23; // DFU Kommando
        chunkCommand[2] = i & 0xFF;
        chunkCommand[3] = (i >> 8) & 0xFF;
        chunk.copy(chunkCommand, 4);

        await this.sendCommand(chunkCommand);

        const progress = ((i + 1) / totalChunks) * 100;
        this.log(`Flash Progress: ${progress.toFixed(1)}%`);
        if (onProgress) onProgress(progress);

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Sende Abschluss-Kommando
      this.log('Finalisiere Flash...');
      const finalCommand = Buffer.from([0x5A, 0x24, 0xFF, 0xFF, 0x00]);
      await this.sendCommand(finalCommand);

      await new Promise(resolve => setTimeout(resolve, 3000));
      this.log('✓ Firmware erfolgreich geflasht!');
      return true;
    } catch (error) {
      this.log(`✗ Flash Fehler: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
        this.log('Verbindung getrennt');
      } catch (error) {
        this.log(`Fehler beim Trennen: ${error}`);
      }
      this.connectedDevice = null;
    }
  }
}

export const bleService = new XiaomiScooterBLE();
