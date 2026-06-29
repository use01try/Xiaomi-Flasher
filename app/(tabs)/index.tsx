import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#00D4FF', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#00D4FF', padding: 16, borderRadius: 8, marginVertical: 8, alignItems: 'center' },
  buttonText: { color: '#0A0E1A', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#111827', borderRadius: 8, padding: 16, marginVertical: 8, borderLeftWidth: 4, borderLeftColor: '#00D4FF' },
  cardTitle: { color: '#00D4FF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardText: { color: '#E8F4FD', fontSize: 14, marginBottom: 4 },
});

export default function HomeScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView style={styles.container}>
        <Text style={styles.title}>⚡ Xiaomi Scooter Manager</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔋 Battery Status</Text>
          <Text style={styles.cardText}>95%</Text>
          <Text style={styles.cardText}>Voltage: 42.0V</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Speed</Text>
          <Text style={styles.cardText}>0 km/h</Text>
          <Text style={styles.cardText}>Mode: Eco</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌡️ Temperature</Text>
          <Text style={styles.cardText}>Motor: 28°C</Text>
          <Text style={styles.cardText}>Controller: 32°C</Text>
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>📱 Connect Scooter</Text>
        </Pressable>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>⚙️ Settings</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
