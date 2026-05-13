import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auryn</Text>
      <Text style={styles.subtitle}>Your AI wellness companion.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FAFBFC",
  },
  title: {
    fontSize: 36,
    fontWeight: "600",
    color: "#4F6D7A",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748B",
  },
});
