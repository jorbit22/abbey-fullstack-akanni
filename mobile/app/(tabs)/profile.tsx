// app/(tabs)/profile.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchProfile,
  saveProfileChanges,
} from "../../src/services/profileActions";

export default function Profile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Reusable load function (initial + refresh)
  const load = async () => {
    setProfileLoading(true);
    try {
      // 1. Instant UI from storage (fast first paint)
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setName(parsed.name || "");
        setBio(parsed.bio || "");
      }

      // 2. Fetch fresh data from backend
      const data = await fetchProfile();
      setUser(data);
      setName(data.name || "");
      setBio(data.bio || "");

      // 3. Save fresh data to storage
      await AsyncStorage.setItem("user", JSON.stringify(data));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    await load();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await saveProfileChanges({ name, bio });
      setUser(updated);
      setName(updated.name || "");
      setBio(updated.bio || "");

      // Keep storage in sync
      await AsyncStorage.setItem("user", JSON.stringify(updated));

      setIsEditMode(false);
      Alert.alert("Success", "Profile updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003087" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={profileLoading}
            onRefresh={onRefresh}
            colors={["#003087"]}
            tintColor="#003087"
            title="Refreshing profile..."
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{user?.name || "User"}</Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.followerCount || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.followingCount || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {isEditMode ? (
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={5}
              placeholder="Tell the world about yourself..."
            />
          ) : (
            <Text style={styles.bioText}>{bio || "No bio yet"}</Text>
          )}
        </View>

        <View style={styles.actions}>
          {isEditMode ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.save]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditMode(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsEditMode(true)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scroll: { padding: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  header: { alignItems: "center", marginBottom: 32 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003087",
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "600", color: "#333" },
  statLabel: { fontSize: 14, color: "#666" },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
  },
  bioText: { fontSize: 16, color: "#333", lineHeight: 24 },
  actions: { alignItems: "center" },
  button: {
    backgroundColor: "#003087",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  save: { backgroundColor: "#003087" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cancelText: { color: "#003087", fontSize: 18, fontWeight: "600" },
});
