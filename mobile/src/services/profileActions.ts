// src/services/profileActions.ts

import { getOwnProfile, updateProfile } from "./userService";
import { Alert } from "react-native";

export const fetchProfile = async () => {
  try {
    const data = await getOwnProfile();

    return data;
  } catch (err: any) {
    Alert.alert("Error", err.message || "Failed to load profile");
    throw err;
  }
};

export const saveProfileChanges = async (values: {
  name?: string;
  bio?: string;
}) => {
  try {
    const updated = await updateProfile(values);

    Alert.alert("Success", "Profile updated!");
    return updated;
  } catch (err: any) {
    Alert.alert("Error", err.message || "Failed to save profile");
    throw err;
  }
};
