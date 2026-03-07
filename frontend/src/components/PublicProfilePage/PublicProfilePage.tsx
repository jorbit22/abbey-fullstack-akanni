// src/components/PublicProfilePage/PublicProfilePage.tsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, Typography, Statistic, Button, Spin } from "antd";
import {
  fetchPublicProfile,
  toggleFollow,
} from "../../services/publicProfileActions";
import "./PublicProfilePage.scss";

const { Title, Text } = Typography;

const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile on mount or id change
  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileData = await fetchPublicProfile(id);
        setUser(profileData);
      } catch {
        // Error already shown by action
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  // Handler: coordinates UI + calls action
  const handleToggleFollow = async () => {
    if (!user || !id) return;

    try {
      const newStatus = await toggleFollow(id, user.isFollowing);

      setUser((prev: any) => ({ ...prev, ...newStatus }));
    } catch {
      // Error already shown by action
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return <div className="not-found">User not found</div>;
  }

  return (
    <div className="public-profile-page">
      <Card className="public-profile-card">
        <div className="public-profile-header">
          <Avatar size={100} className="public-profile-avatar-default" />
          <Title level={1} className="public-profile-name">
            {user.name}
          </Title>

          <div className="public-profile-stats">
            <Statistic title="Followers" value={user.followerCount || 0} />
            <Statistic title="Following" value={user.followingCount || 0} />
          </div>
        </div>

        <div className="public-profile-bio">
          <Text className="bio-label">About</Text>
          <Text className="bio-text">{user.bio || "No bio yet"}</Text>
        </div>

        <div className="public-profile-actions">
          <Button
            type={user.isFollowing ? "default" : "primary"}
            size="large"
            block
            className="follow-btn"
            onClick={handleToggleFollow}
          >
            {user.isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PublicProfilePage;
