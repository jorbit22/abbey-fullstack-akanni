// app/_layout.tsx

import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate brief splash delay (can be removed later)
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500); // 1.5 seconds minimum splash

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>App Connect</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Splash is handled above – not needed as screen */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#003087",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 32,
  },
  spinner: {
    marginTop: 32,
  },
});
