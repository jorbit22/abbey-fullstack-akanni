// src/services/authActions.ts
import { login, register } from "./authService";
import { notification } from "antd";
import { NavigateFunction } from "react-router-dom";

export const handleLogin = async (
  values: { email: string; password: string },
  navigate: NavigateFunction,
) => {
  try {
    await login(values);
    notification.success({
      message: "Signed in successfully",
      description: "Welcome back to Abbey Connect!",
    });
    navigate("/profile");
  } catch (error: any) {
    throw error;
  }
};

export const handleRegister = async (values: {
  email: string;
  password: string;
  name?: string;
}) => {
  try {
    await register(values);
    notification.success({
      message: "Account created successfully",
      description: "Please sign in with your new credentials below.",
      placement: "topRight",
      duration: 5,
    });
    return values.email;
  } catch (error: any) {
    throw error;
  }
};
