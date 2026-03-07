// src/components/AuthPage/AuthPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Typography, notification } from "antd";
import { handleLogin, handleRegister } from "../../services/authActions";
import "./AuthPage.scss";

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      if (isLogin) {
        await handleLogin(values);
      } else {
        const email = await handleRegister(values);
        // Switch to login + pre-fill email
        setIsLogin(true);
        form.setFieldsValue({ email, password: undefined });
      }
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Something went wrong",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Title level={1} className="auth-title">
            {isLogin ? "Welcome back" : "Join Abbey Connect"}
          </Title>
          <Text className="auth-subtitle">
            {isLogin
              ? "Your connections are waiting, sign in and dive in"
              : "Create your profile, start connecting today"}
          </Text>
        </div>

        <Form
          form={form}
          name="auth-form"
          onFinish={onFinish}
          layout="vertical"
          className="auth-form"
        >
          {!isLogin && (
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input size="large" />
            </Form.Item>
          )}

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="auth-submit-btn"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <a onClick={() => setIsLogin(false)}>Create one</a>
              <br />
              <a>Forgot password?</a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a onClick={() => setIsLogin(true)}>Sign in</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
