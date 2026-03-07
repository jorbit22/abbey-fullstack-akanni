// src/services/profileActions.ts
import { getOwnProfile, updateProfile } from "./userService";
import { notification } from "antd";

// Fetch current user profile (for profile page)
export const fetchProfile = async () => {
  try {
    const data = await getOwnProfile();
    return data;
  } catch (err: any) {
    notification.error({
      message: "Failed to load profile",
      description: err.response?.data?.message || "Please log in again",
    });
    throw err;
  }
};

// Update profile + handle success/error
export const saveProfileChanges = async (values: any) => {
  try {
    const updated = await updateProfile(values);
    notification.success({
      message: "Profile updated",
      description: "Your changes have been saved successfully.",
    });
    return updated;
  } catch (err: any) {
    notification.error({
      message: "Update failed",
      description: err.response?.data?.message || "Something went wrong",
    });
    throw err;
  }
};
