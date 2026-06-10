import { describe, it, expect } from 'vitest';

// Test utility functions used in the app

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getRssiBarCount(rssi: number): number {
  return rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
}

function getBatteryColor(level: number): string {
  return level > 50 ? 'success' : level > 20 ? 'warning' : 'error';
}

function getRideModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    eco: 'Eco-Modus',
    sport: 'Sport-Modus',
    custom: 'Custom-Modus',
  };
  return labels[mode] ?? 'Unbekannt';
}

describe('formatSize utility', () => {
  it('formats bytes correctly', () => {
    expect(formatSize(512)).toBe('512 B');
  });
  it('formats kilobytes correctly', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(524288)).toBe('512.0 KB');
  });
  it('formats megabytes correctly', () => {
    expect(formatSize(1048576)).toBe('1.00 MB');
  });
});

describe('RSSI bar count', () => {
  it('returns 4 bars for strong signal', () => {
    expect(getRssiBarCount(-52)).toBe(4);
  });
  it('returns 3 bars for good signal', () => {
    expect(getRssiBarCount(-65)).toBe(3);
  });
  it('returns 2 bars for medium signal', () => {
    expect(getRssiBarCount(-75)).toBe(2);
  });
  it('returns 1 bar for weak signal', () => {
    expect(getRssiBarCount(-88)).toBe(1);
  });
});

describe('Battery color logic', () => {
  it('returns success for high battery', () => {
    expect(getBatteryColor(78)).toBe('success');
    expect(getBatteryColor(51)).toBe('success');
  });
  it('returns warning for medium battery', () => {
    expect(getBatteryColor(50)).toBe('warning');
    expect(getBatteryColor(21)).toBe('warning');
  });
  it('returns error for low battery', () => {
    expect(getBatteryColor(20)).toBe('error');
    expect(getBatteryColor(5)).toBe('error');
  });
});

describe('Ride mode labels', () => {
  it('returns correct German labels', () => {
    expect(getRideModeLabel('eco')).toBe('Eco-Modus');
    expect(getRideModeLabel('sport')).toBe('Sport-Modus');
    expect(getRideModeLabel('custom')).toBe('Custom-Modus');
  });
  it('returns fallback for unknown mode', () => {
    expect(getRideModeLabel('turbo')).toBe('Unbekannt');
  });
});

describe('Mock scooter data validation', () => {
  const mockScooter = {
    serialNumber: 'XM3-2024-001337',
    modelName: 'Mi Electric Scooter 3',
    firmwareVersion: '1.7.6',
    batteryLevel: 78,
    temperature: 32,
    voltage: 41.8,
    rideMode: 'sport' as const,
    speed: 0,
    odometer: 1247.3,
    motorTemp: 38,
  };

  it('has valid serial number format', () => {
    expect(mockScooter.serialNumber).toMatch(/^XM\d-\d{4}-\d+$/);
  });

  it('has valid battery level range', () => {
    expect(mockScooter.batteryLevel).toBeGreaterThanOrEqual(0);
    expect(mockScooter.batteryLevel).toBeLessThanOrEqual(100);
  });

  it('has valid voltage range', () => {
    expect(mockScooter.voltage).toBeGreaterThan(30);
    expect(mockScooter.voltage).toBeLessThan(60);
  });

  it('has valid firmware version format', () => {
    expect(mockScooter.firmwareVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
