import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginResponse {
  accessToken: string;
  user?: any;
  message?: string;
}

const API = axios.create({
  baseURL: "https://abbeyfullstack.onrender.com/api/v1",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  async (config: any): Promise<any> => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const login = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await API.post<LoginResponse>("/auth/login", data);
    const { accessToken, user } = response.data;
    await AsyncStorage.setItem("accessToken", accessToken);

    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  } catch (err: any) {
    throw err.response?.data || { message: "Login failed" };
  }
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await API.post("/auth/register", data);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || { message: "Registration failed" };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("user");
};
