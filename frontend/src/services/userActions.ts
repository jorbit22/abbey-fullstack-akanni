// src/services/userActions.ts
import {
  getUsers,
  followUser,
  unfollowUser,
  getFollowStatus,
} from "./userService";
import { notification } from "antd";

export const fetchDiscoveryUsers = async (
  search: string,
  page: number,
  limit: number = 9,
) => {
  try {
    const data = await getUsers({ search, page, limit });

    // Enrich with follow status (parallel for speed)
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
    notification.warning({
      message: "No users available",
      description:
        err.response?.data?.message ||
        "There are no users matching your search or in the system yet.",
    });
    throw err; // let component handle loading state
  }
};

export const toggleFollowUser = async (
  userId: string,
  currentlyFollowing: boolean,
  onSuccess?: () => void,
) => {
  try {
    if (currentlyFollowing) {
      await unfollowUser(userId);
      notification.success({ message: "Unfollowed successfully" });
    } else {
      await followUser(userId);
      notification.success({ message: "Followed successfully" });
    }

    // Optional: refresh caller
    if (onSuccess) onSuccess();

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
