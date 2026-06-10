import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticTab } from "@/components/haptic-tab";

const DARK_COLORS = {
  background: '#0A0E1A',
  border: '#1E3A5F',
  primary: '#00D4FF',
  muted: '#6B8CAE',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DARK_COLORS.primary,
        tabBarInactiveTintColor: DARK_COLORS.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: '#111827',
          borderTopColor: DARK_COLORS.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="bluetooth" color={color} />,
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: "Scooter",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="electric-scooter" color={color} />,
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: "Firmware",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Einstellungen",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
