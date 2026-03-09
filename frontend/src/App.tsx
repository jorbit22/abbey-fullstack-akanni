// src/App.tsx

import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Layout, Button, Drawer, notification } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import AuthPage from "./components/AuthPage/AuthPage";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import DiscoveryPage from "./components/DiscoveryPage/DiscoveryPage";
import PublicProfilePage from "./components/PublicProfilePage/PublicProfilePage";
import HomePage from "./components/HomePage/HomePage";
import { logout } from "./services/authService";
import "./App.scss";

const { Content } = Layout;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  // Listen for auth:logout event (from api interceptor)
  useEffect(() => {
    const handleAuthLogout = () => {
      localStorage.removeItem("accessToken");
      navigate("/auth", { replace: true });
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [navigate]);

  const navLinks = [
    { path: "/", label: isLoggedIn ? "Home" : "Sign In" },
    { path: "/profile", label: "Profile", requiresAuth: true },
    { path: "/discovery", label: "Discover", requiresAuth: true },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.requiresAuth || isLoggedIn,
  );

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("accessToken");
      notification.success({
        message: "Logged out",
        description: "See you soon!",
        placement: "topRight",
      });
      setMobileMenuOpen(false);
      navigate("/auth", { replace: true });
    } catch (err) {
      notification.error({
        message: "Logout failed",
        description: "Signed out locally anyway.",
      });
      localStorage.removeItem("accessToken");
      navigate("/auth", { replace: true });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Layout className="app-layout">
      {/* Premium Header / Nav */}
      <nav className="premium-nav">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            Abbey Connect
          </Link>

          {/* Desktop Nav Links + Logout */}
          <div className="nav-links desktop">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <Button
                type="text"
                onClick={handleLogout}
                className="nav-logout"
                style={{ color: "white", fontWeight: 500 }}
              >
                Logout
              </Button>
            )}
          </div>

          {/* Hamburger Button – ALWAYS visible on mobile */}
          <Button
            type="text"
            icon={
              <MenuOutlined style={{ fontSize: "1.8rem", color: "white" }} />
            }
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn"
          />
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={<span className="drawer-title">Abbey Connect</span>}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <div className="mobile-menu">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-link ${isActive(link.path) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}

          {isLoggedIn && (
            <div
              className="mobile-link logout-mobile"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              Logout
            </div>
          )}
        </div>
      </Drawer>

      {/* Main Content */}
      <Content className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <HomePage /> : <Navigate to="/auth" replace />
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/discovery" element={<DiscoveryPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
