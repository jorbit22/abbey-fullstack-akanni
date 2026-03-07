// src/services/authActions.ts
import { login, register } from "./authService";
import { notification } from "antd";

export const handleLogin = async (values: {
  email: string;
  password: string;
}) => {
  try {
    await login(values);
    notification.success({
      message: "Signed in successfully",
      description: "Welcome back to Abbey Connect!",
    });
    window.location.href = "/profile";
  } catch (error: any) {
    throw error; // let component handle error display
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
    return values.email; // return email to pre-fill login form
  } catch (error: any) {
    throw error;
  }
};
