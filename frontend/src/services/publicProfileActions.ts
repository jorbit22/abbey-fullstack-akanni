// src/services/publicProfileActions.ts
import {
  getPublicProfile,
  followUser,
  unfollowUser,
  getFollowStatus,
} from "./userService";
import { notification } from "antd";

// Fetch public profile + enrich with follow status
export const fetchPublicProfile = async (userId: string) => {
  try {
    const profile = await getPublicProfile(userId);
    const status = await getFollowStatus(userId);
    return { ...profile, ...status };
  } catch (err: any) {
    notification.error({
      message: "Failed to load profile",
      description:
        err.response?.data?.message || "User not found or error occurred",
    });
    throw err;
  }
};

// Toggle follow/unfollow + refresh status
export const toggleFollow = async (
  userId: string,
  currentlyFollowing: boolean,
): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> => {
  try {
    if (currentlyFollowing) {
      await unfollowUser(userId);
      notification.success({ message: "Unfollowed successfully" });
    } else {
      await followUser(userId);
      notification.success({ message: "Followed successfully" });
    }

    // Return latest status for immediate UI update
    return await getFollowStatus(userId);
  } catch (err: any) {
    notification.error({
      message: "Action failed",
      description: err.response?.data?.message || "Something went wrong",
    });
    throw err;
  }
};
