// app/(tabs)/discovery.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  fetchDiscoveryUsers,
  toggleFollow,
} from "../../src/services/userActions";

export default function Discovery() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [search, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchDiscoveryUsers(search, page);
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      setUsers([]);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const onFollowToggle = async (userId: string, isFollowing: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isFollowing: !isFollowing } : u,
      ),
    );

    try {
      const newStatus = await toggleFollow(userId, isFollowing);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...newStatus } : u)),
      );
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing } : u)),
      );
      Alert.alert("Error", "Failed to update follow");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.avatarSmall} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.bio} numberOfLines={2}>
          {item.bio || "No bio yet"}
        </Text>
        <Text style={styles.stats}>
          {item.followerCount || 0} followers · {item.followingCount || 0}{" "}
          following
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
        onPress={() => onFollowToggle(item.id, item.isFollowing)}
      >
        <Text style={styles.followText}>
          {item.isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#003087" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.center}>
          <Text>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (users.length < total) setPage((p) => p + 1);
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setPage(1); // reset pagination
                loadUsers(); // fetch fresh
              }}
              colors={["#003087"]}
              tintColor="#003087"
              title="Refreshing..."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  searchBox: { padding: 16, backgroundColor: "#fff" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 16,
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600", color: "#333" },
  bio: { fontSize: 14, color: "#666", marginBottom: 8 },
  stats: { fontSize: 14, color: "#888" },
  followBtn: {
    backgroundColor: "#003087",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    minWidth: 100,
  },
  followingBtn: { backgroundColor: "#28a745" },
  followText: { color: "#fff", fontWeight: "600" },
});
