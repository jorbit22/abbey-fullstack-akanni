// app/users/[id].tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getPublicProfile,
  followUser,
  unfollowUser,
  getFollowStatus,
} from "../../src/services/userService";

export default function PublicProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await getPublicProfile(id);
        const status = await getFollowStatus(id);
        setUser({ ...profile, ...status });
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!user || !id) return;

    const wasFollowing = user.isFollowing;

    // Optimistic update
    setUser((prev: any) => ({ ...prev, isFollowing: !wasFollowing }));

    try {
      if (wasFollowing) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }
      const newStatus = await getFollowStatus(id);
      setUser((prev: any) => ({ ...prev, ...newStatus }));
    } catch {
      // Rollback on error
      setUser((prev: any) => ({ ...prev, isFollowing: wasFollowing }));
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003087" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{user.name || "Unknown User"}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followerCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.bioTitle}>About</Text>
        <Text style={styles.bioText}>{user.bio || "No bio yet"}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.followButton,
          user.isFollowing ? styles.followingButton : null,
        ]}
        onPress={handleToggleFollow}
      >
        <Text style={styles.followButtonText}>
          {user.isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#003087",
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  bioSection: {
    padding: 24,
    backgroundColor: "#fff",
    marginTop: 16,
  },
  bioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  followButton: {
    backgroundColor: "#003087",
    borderRadius: 12,
    padding: 16,
    margin: 24,
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: "#28a745",
  },
  followButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
