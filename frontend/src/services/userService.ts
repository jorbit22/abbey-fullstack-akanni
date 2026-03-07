// src/services/userService.ts
import api from "./api";

export const getOwnProfile = async () => {
  const response = await api.get("/users/me");
  return response.data.user;
};

export const updateProfile = async (data: { name?: string; bio?: string }) => {
  const response = await api.patch("/users/me", data);
  return response.data.user;
};

export const getUsers = async (params: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/users", { params });
  return response.data;
};

export const getPublicProfile = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.user;
};

export const followUser = async (userId: string) => {
  const response = await api.post(`/follows/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId: string) => {
  const response = await api.delete(`/follows/${userId}`);
  return response.data;
};

export const getFollowStatus = async (userId: string) => {
  const response = await api.get(`/users/${userId}/follow-status`);
  return response.data;
};
