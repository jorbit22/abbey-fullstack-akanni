// src/components/HomePage/HomePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Card,
  Avatar,
  Statistic,
  Row,
  Col,
  Divider,
  Spin,
} from "antd";
import { fetchHomeData } from "../../services/homeActions";
import "./HomePage.scss";

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const data = await fetchHomeData(navigate);
        setUser(data.user);
        setSuggestedUsers(data.suggestedUsers);
      } catch {
        // Error already shown by action
        setUser(null);
        setSuggestedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [navigate]);

  const handleDiscoverClick = () => {
    navigate("/discovery");
  };

  const handleCardClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Zone 1 – Top: Personalized greeting + stats */}
      <div className="home-header">
        <Title level={1} className="home-greeting">
          Good morning, {user?.name || "User"}
        </Title>
        <div className="home-stats">
          <Statistic title="Followers" value={user?.followerCount || 0} />
          <Statistic title="Following" value={user?.followingCount || 0} />
          <Statistic title="Notifications" value={user?.notifications || 0} />
        </div>
      </div>

      {/* King action */}
      <Button
        type="primary"
        size="large"
        block
        className="home-discover-btn"
        onClick={handleDiscoverClick}
      >
        Discover New Peers
      </Button>

      {/* Zone 2 – Center: Suggested connections */}
      <div className="home-content">
        <Divider>Suggested Connections</Divider>
        {suggestedUsers.length === 0 ? (
          <Text type="secondary">No suggested connections yet</Text>
        ) : (
          <Row gutter={[16, 24]}>
            {suggestedUsers.map((person) => (
              <Col xs={24} sm={12} md={8} key={person.id}>
                <Card
                  hoverable
                  className="user-card"
                  onClick={() => handleCardClick(person.id)}
                >
                  <div className="user-card-content">
                    <Avatar size={64} className="user-avatar" />
                    <Title level={4} className="user-name">
                      {person.name}
                    </Title>
                    <Text className="user-bio">
                      {person.bio || "No bio yet"}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Zone 3 – Bottom */}
      <div className="home-footer">
        <Text type="secondary">Abbey Connect © 2026</Text>
      </div>
    </div>
  );
};

export default HomePage;
