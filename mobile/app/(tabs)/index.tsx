// app/(tabs)/index.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOwnProfile, getUsers } from "../../src/services/userService";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const me = await getOwnProfile();
      setUser(me);

      const data = await getUsers({ limit: 6 });
      setSuggested(data.users || []);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load home");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const goToDiscovery = () => router.push("/discovery");

  const goToPublic = (userId: string) => router.push(`/users/${userId}`);

  // Logout function
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear token from storage
            await AsyncStorage.removeItem("accessToken");

            await AsyncStorage.removeItem("user");

            // Redirect to Auth tab
            router.replace("/(tabs)/auth");

            Alert.alert("Logged Out", "You have been successfully logged out.");
          } catch (err) {
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#003087"]}
          tintColor="#003087"
          title="Refreshing..."
        />
      }
    >
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#003087" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#003087" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.greeting}>
              Good morning, {user?.name || "User"}
            </Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{user?.followerCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{user?.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.discoverBtn} onPress={goToDiscovery}>
            <Text style={styles.btnText}>Discover New Peers</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Connections</Text>
            {suggested.length === 0 ? (
              <Text>No suggestions yet</Text>
            ) : (
              suggested.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.card}
                  onPress={() => goToPublic(p.id)}
                >
                  <View style={styles.cardInner}>
                    <View style={styles.avatarSmall} />
                    <View style={styles.info}>
                      <Text style={styles.nameSmall}>{p.name}</Text>
                      <Text style={styles.bioSmall} numberOfLines={2}>
                        {p.bio || "No bio yet"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  logoutButton: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#003087",
  },

  header: { padding: 24, backgroundColor: "#fff", paddingTop: 60 }, // extra top padding for logout button
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003087",
    marginBottom: 16,
  },
  stats: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "600" },
  statLabel: { fontSize: 14, color: "#666" },
  discoverBtn: {
    backgroundColor: "#003087",
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  section: { paddingHorizontal: 24, paddingBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInner: { flexDirection: "row", alignItems: "center" },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 16,
  },
  info: { flex: 1 },
  nameSmall: { fontSize: 18, fontWeight: "600", color: "#333" },
  bioSmall: { fontSize: 14, color: "#666" },
});
