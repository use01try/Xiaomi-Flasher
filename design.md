# Xiaomi Scooter Manager – Design Plan

## App Concept
A professional dark-themed mobile app for Xiaomi scooter management and diagnostics. The design follows Material 3 principles adapted to iOS HIG, with a cyberpunk/tech aesthetic using electric blue and dark backgrounds.

## Color Palette
- **Background**: `#0A0E1A` (deep dark navy)
- **Surface**: `#111827` (dark card surface)
- **Surface Elevated**: `#1A2235` (slightly lighter cards)
- **Primary**: `#00D4FF` (electric cyan/blue – Xiaomi brand-inspired)
- **Secondary**: `#FF6B35` (warning orange)
- **Success**: `#00E676` (bright green)
- **Warning**: `#FFB300` (amber)
- **Error**: `#FF1744` (red)
- **Foreground**: `#E8F4FD` (light text)
- **Muted**: `#6B8CAE` (secondary text)
- **Border**: `#1E3A5F` (subtle borders)

## Screen List

### 1. Dashboard (Home)
- Connected scooter status card (large hero card)
- Battery level with animated ring
- Speed, temperature, voltage metrics
- Quick action buttons (Scan, Connect, Firmware)
- Recent activity log

### 2. BLE Scanner Screen
- "Scooter suchen" button with pulse animation
- FlatList of discovered devices
  - Device name, MAC address, RSSI signal bars
  - Connect button per device
- Scan progress indicator
- Permission status banner

### 3. Connection Screen
- Connection status (Connecting / Connected / Disconnected)
- Animated connection indicator
- Auto-reconnect toggle
- Error dialog on failure
- Device details (name, MAC, RSSI)

### 4. Scooter Info Screen
- Serial number, model name, firmware version
- Battery percentage with visual gauge
- Temperature (motor + battery)
- Voltage reading
- Ride mode selector (Eco / Sport / Custom)
- Real-time data refresh button

### 5. File Manager Screen
- File picker for .bin / .zip firmware files
- Selected file card: name, size, SHA-256 hash
- Integrity check status badge
- "Firmware schreiben" action button
- Upload progress bar

### 6. Controller Modification Screen
- Speed limit adjustment slider
- Motor power settings
- Bootloader mode toggle
- Advanced parameters list
- Warning dialog before applying changes

### 7. Settings Screen
- App theme toggle
- BLE scan timeout setting
- Auto-reconnect settings
- About / version info

## Key User Flows

### Connect Flow
1. Dashboard → tap "Scooter suchen" → BLE Scanner
2. Scanner shows devices → tap device → Connection Screen
3. Connection established → auto-navigate to Dashboard (connected state)

### Firmware Update Flow
1. Dashboard → tap "Firmware" → File Manager
2. Select .bin/.zip file → SHA-256 computed → integrity check
3. Tap "Firmware schreiben" → progress bar → success/error

### Controller Mod Flow
1. Dashboard → tap "Controller" → Controller Modification
2. Adjust settings → tap "Anwenden" → confirmation dialog
3. Confirm → changes applied → status feedback

## Navigation Structure
- Bottom Tab Bar: Dashboard | Scanner | Info | Files | Settings
- Modal screens: Connection, Controller Mod, Bootloader
- Stack navigation within tabs

## Typography
- Headers: Bold, 24-28px
- Subheaders: SemiBold, 16-18px
- Body: Regular, 14px
- Captions: Regular, 12px, muted color

## Component Design
- Cards: rounded-2xl, border with subtle glow on primary
- Buttons: rounded-xl, gradient or solid primary
- Status badges: pill-shaped with color coding
- Progress bars: thin, glowing primary color
- Icons: MaterialIcons, consistent 24px
