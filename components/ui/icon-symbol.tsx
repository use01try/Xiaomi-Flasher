import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  // BLE / Bluetooth
  "bluetooth": "bluetooth",
  "bluetooth.fill": "bluetooth",
  "antenna.radiowaves.left.and.right": "wifi",
  "wifi": "wifi",
  // Dashboard
  "speedometer": "speed",
  "gauge": "speed",
  "bolt.fill": "bolt",
  "thermometer": "thermostat",
  "battery.100": "battery-full",
  "battery.75": "battery-5-bar",
  "battery.50": "battery-3-bar",
  "battery.25": "battery-1-bar",
  "battery.0": "battery-alert",
  // Files
  "folder.fill": "folder",
  "doc.fill": "description",
  "doc.badge.plus": "note-add",
  "arrow.up.doc.fill": "upload-file",
  "checkmark.shield.fill": "verified",
  "xmark.shield.fill": "gpp-bad",
  // Controller
  "wrench.fill": "build",
  "gearshape.fill": "settings",
  "cpu": "memory",
  "memorychip": "memory",
  "slider.horizontal.3": "tune",
  // Status
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "arrow.clockwise": "refresh",
  "arrow.triangle.2.circlepath": "sync",
  // Misc
  "power": "power-settings-new",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "magnifyingglass": "search",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  "trash.fill": "delete",
  "square.and.arrow.up": "share",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-horiz",
  "person.fill": "person",
  "star.fill": "star",
  "map.fill": "map",
  "location.fill": "location-on",
  "chart.bar.fill": "bar-chart",
  "waveform": "graphic-eq",
  "play.fill": "play-arrow",
  "stop.fill": "stop",
  "pause.fill": "pause",
  "scooter": "electric-scooter",
  "electric-scooter": "electric-scooter",
  "motorcycle": "electric-scooter",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
