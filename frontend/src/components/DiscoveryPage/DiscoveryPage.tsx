// src/components/DiscoveryPage/DiscoveryPage.tsx

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  Avatar,
  Typography,
  Pagination,
  Row,
  Col,
  Spin,
} from "antd";
import {
  fetchDiscoveryUsers,
  toggleFollowUser,
} from "../../services/userActions";
import "./DiscoveryPage.scss";

const { Search } = Input;
const { Title, Text } = Typography;

const DiscoveryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch users when search or page changes
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchDiscoveryUsers(searchTerm, currentPage);
        setUsers(data.users);
        setTotal(data.total);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [searchTerm, currentPage]);

  // Handler: coordinates UI + calls action
  const handleToggleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      const newStatus = await toggleFollowUser(userId, isFollowing, () => {
        // Optional: refresh entire list after follow/unfollow
        // setCurrentPage(currentPage); // trigger re-fetch
      });

      // Immediate UI update for this user
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...newStatus } : u)),
      );
    } catch {
      // Error already shown by action
    }
  };

  return (
    <div className="discovery-page">
      <div className="discovery-header">
        <Title level={1} className="discovery-title">
          Discover Peers
        </Title>
        <Search
          placeholder="Search by name or keyword..."
          allowClear
          enterButton="Search"
          size="large"
          onSearch={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          className="discovery-search"
        />
      </div>

      {loading ? (
        <div className="loading">
          <Spin size="large" tip="Loading users..." />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Title level={3}>No users found</Title>
          <Text>
            Try a different search or come back later when more people join.
          </Text>
        </div>
      ) : (
        <Row gutter={[16, 24]} className="discovery-grid">
          {users.map((user) => (
            <Col xs={24} sm={12} md={8} key={user.id}>
              <Card className="user-card" hoverable>
                <div className="user-card-content">
                  <Avatar size={72} className="user-avatar-default" />
                  <Title level={4} className="user-name">
                    {user.name}
                  </Title>
                  <Text className="user-bio">
                    {user.bio?.substring(0, 70) || "No bio yet"}...
                  </Text>
                  <div className="user-stats">
                    <Text strong>{user.followerCount || 0}</Text> followers ·{" "}
                    <Text strong>{user.followingCount || 0}</Text> following
                  </div>
                  <Button
                    type={user.isFollowing ? "default" : "primary"}
                    size="middle"
                    block
                    className="follow-btn"
                    onClick={() =>
                      handleToggleFollow(user.id, user.isFollowing)
                    }
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="discovery-pagination">
        <Pagination
          current={currentPage}
          total={total}
          pageSize={9}
          onChange={setCurrentPage}
          showSizeChanger={false}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default DiscoveryPage;
