// src/services/homeActions.ts
import { getOwnProfile } from "./userService";
import { getUsers } from "./userService";
import { notification } from "antd";
import { NavigateFunction } from "react-router-dom";

// Fetch all data needed for Home page (current user + suggested users)
export const fetchHomeData = async (navigate: NavigateFunction) => {
  try {
    // Fetch current user
    const userData = await getOwnProfile();

    // Fetch suggested users (limit to 6 for home)
    const usersData = await getUsers({ limit: 6 });

    return {
      user: userData,
      suggestedUsers: usersData.users || [],
    };
  } catch (err: any) {
    notification.error({
      message: "Failed to load home page",
      description: err.response?.data?.message || "Something went wrong",
    });
    // Optional: redirect to login if auth error
    if (err.response?.status === 401) {
      navigate("/auth");
    }
    throw err;
  }
};
