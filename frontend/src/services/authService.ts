// src/services/authService.ts
import api from "./api";

export const register = async (data: {
  email: string;
  password: string;
  name?: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);
  const { accessToken } = response.data;
  localStorage.setItem("accessToken", accessToken);
  return response.data;
};

export const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("accessToken");
};
