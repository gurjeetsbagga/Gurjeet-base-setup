import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.description}>The screen you're looking for doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
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
  code: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A2B33",
    letterSpacing: -0.5,
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  link: {
    marginTop: 24,
    backgroundColor: "#4F6D7A",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
