// src/services/userActions.ts

import {
  getUsers,
  followUser,
  unfollowUser,
  getFollowStatus,
} from "./userService";
import { Alert } from "react-native";

export const fetchDiscoveryUsers = async (
  search: string = "",
  page: number = 1,
  limit: number = 9,
) => {
  try {
    const data = await getUsers({ search, page, limit });

    // Enrich with follow status
    const usersWithStatus = await Promise.all(
      (data.users || []).map(async (user: any) => {
        try {
          const status = await getFollowStatus(user.id);
          return { ...user, ...status };
        } catch {
          return { ...user, isFollowing: false, isFollowedBy: false };
        }
      }),
    );

    return {
      users: usersWithStatus,
      total: data.total || 0,
    };
  } catch (err: any) {
    Alert.alert("Error", err.message || "Failed to load users");
    throw err;
  }
};

export const toggleFollow = async (
  userId: string,
  currentlyFollowing: boolean,
): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> => {
  try {
    if (currentlyFollowing) {
      await unfollowUser(userId);
      Alert.alert("Success", "Unfollowed successfully");
    } else {
      await followUser(userId);
      Alert.alert("Success", "Followed successfully");
    }

    return await getFollowStatus(userId);
  } catch (err: any) {
    Alert.alert("Error", err.message || "Action failed");
    throw err;
  }
};
