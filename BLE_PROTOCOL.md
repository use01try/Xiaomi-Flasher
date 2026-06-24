# Xiaomi Scooter BLE Protokoll

## Unterstützte Modelle
- Xiaomi M365
- Xiaomi M365 Pro
- Xiaomi 1S
- Xiaomi Lite/Essential
- Xiaomi M365 Pro 2
- Xiaomi 4 Pro 2nd Gen
- Xiaomi 4 (Pro/Standard)
- Xiaomi 3

## BLE Kommunikation

### Service UUIDs
- **Control Service**: `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
- **TX Characteristic**: `6E400002-B5A3-F393-E0A9-E50E24DCCA9E` (Write)
- **RX Characteristic**: `6E400003-B5A3-F393-E0A9-E50E24DCCA9E` (Notify)

### Protokoll Struktur
```
[Header] [Cmd] [Addr] [Data] [Checksum]
1 Byte   1 Byte 1 Byte N Bytes 1 Byte
```

### Kommandos
- **0x20**: Read Register
- **0x21**: Write Register
- **0x22**: Execute Command
- **0x23**: DFU Mode (Firmware Flash)

## DFU (Firmware Flash) Protokoll

### DFU Modus aktivieren
1. Sende: `[0x5A, 0x5B, 0x5C, 0x5D]` (Magic Bytes)
2. Warte auf Bestätigung: `[0xA5, 0xB5, 0xC5, 0xD5]`
3. Scooter startet im DFU-Modus neu

### Firmware übertragen
1. Firmware in 256-Byte Chunks aufteilen
2. Sende Chunk mit Sequenznummer
3. Warte auf ACK
4. Wiederhole bis alle Chunks übertragen
5. Sende Abschluss-Kommando
6. Scooter validiert und flasht Firmware

### Checksummen
- CRC16-CCITT für Firmware-Validierung
- XOR-Checksum für Kommandos

## Register Map (Auszug)
- **0x20**: Batterie-Prozent
- **0x21**: Temperatur
- **0x22**: Spannung
- **0x23**: Strom
- **0x24**: Geschwindigkeit
- **0x25**: Fahrmodus
- **0x26**: Seriennummer
- **0x27**: Firmware-Version
- **0x28**: Modell-ID
