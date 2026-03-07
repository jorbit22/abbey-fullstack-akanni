// src/components/ProfilePage/ProfilePage.tsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Avatar,
  Statistic,
  Card,
  Spin,
} from "antd";
import {
  fetchProfile,
  saveProfileChanges,
} from "../../services/profileActions";
import "./ProfilePage.scss";

const { Title } = Typography;
const { TextArea } = Input;

const ProfilePage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [form] = Form.useForm();

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const data = await fetchProfile();
        setUserData(data);
        form.setFieldsValue({
          name: data.name,
          bio: data.bio || "",
        });
      } catch {
        // Error already shown by action
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [form]);

  // Handler: coordinates UI + calls action
  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields(); // ensure validation
      const updated = await saveProfileChanges(values);
      setUserData(updated);
      setIsEditMode(false);
    } catch (err) {
      // Error already shown by action
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="loading">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar size={100} className="profile-avatar-default" />
          <Title level={1} className="profile-name">
            {userData?.name || "User"}
          </Title>

          <div className="profile-stats">
            <Statistic title="Followers" value={userData?.followerCount || 0} />
            <Statistic
              title="Following"
              value={userData?.followingCount || 0}
            />
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave} // now triggers handler
          disabled={!isEditMode}
          className={`profile-form ${isEditMode ? "edit-mode" : ""}`}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>

          <Form.Item label="Bio" name="bio">
            <TextArea rows={4} placeholder="Tell the world about yourself..." />
          </Form.Item>
        </Form>

        <div className="profile-actions">
          {isEditMode ? (
            <>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="save-btn"
              >
                Save Changes
              </Button>
              <Button onClick={() => setIsEditMode(false)}>Cancel</Button>
            </>
          ) : (
            <Button type="primary" onClick={() => setIsEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
