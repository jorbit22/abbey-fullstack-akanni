// src/services/userService.ts

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "https://abbeyfullstack.onrender.com/api/v1",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(async (config: any): Promise<any> => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface User {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  [key: string]: any;
}

interface ProfileResponse {
  message?: string;
  user?: User;
  data?: any;
  users?: User[];
  total?: number;
}

export const getOwnProfile = async (): Promise<User> => {
  const res = await API.get<ProfileResponse>("/users/me");
  return res.data.user ?? res.data.data;
};

export const updateProfile = async (data: {
  name?: string;
  bio?: string;
}): Promise<User> => {
  const res = await API.patch<ProfileResponse>("/users/me", data);
  return res.data.user ?? res.data.data;
};

export const getPublicProfile = async (userId: string): Promise<User> => {
  const res = await API.get<ProfileResponse>(`/users/${userId}`);
  return res.data.user ?? res.data.data;
};

export const getUsers = async (params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; total: number }> => {
  const res = await API.get<ProfileResponse>("/users", { params });

  const payload = res.data.data ?? res.data;
  return {
    users: payload.users ?? [],
    total: payload.total ?? 0,
  };
};

export const followUser = async (userId: string): Promise<any> => {
  const res = await API.post(`/follows/${userId}`);
  return res.data;
};

export const unfollowUser = async (userId: string): Promise<any> => {
  const res = await API.delete(`/follows/${userId}`);
  return res.data;
};

export const getFollowStatus = async (
  userId: string,
): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> => {
  const res = await API.get<ProfileResponse>(`/users/${userId}/follow-status`);
  const payload = res.data.data ?? res.data;
  return {
    isFollowing: payload.isFollowing ?? false,
    isFollowedBy: payload.isFollowedBy ?? false,
  };
};
