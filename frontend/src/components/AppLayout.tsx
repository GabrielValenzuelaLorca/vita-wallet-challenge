import { Layout, Menu, Button, Typography, Avatar } from "antd";
import {
  DashboardOutlined,
  SwapOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import type { ReactNode } from "react";

const { Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  label: ReactNode;
  icon: ReactNode;
}

const menuItems: MenuItem[] = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: <Link to="/">Dashboard</Link>,
  },
  {
    key: "/exchange",
    icon: <SwapOutlined />,
    label: <Link to="/exchange">Exchange</Link>,
  },
  {
    key: "/history",
    icon: <UnorderedListOutlined />,
    label: <Link to="/history">History</Link>,
  },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth={72}
        style={{
          background: "var(--vw-sidebar-bg, #003B46)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                padding: "24px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--vw-primary, #07A5A7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                V
              </div>
              <Text
                strong
                style={{ color: "#fff", fontSize: 18, whiteSpace: "nowrap" }}
              >
                Vita Wallet
              </Text>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                background: "transparent",
                borderRight: 0,
                fontSize: 15,
              }}
            />
          </div>
          <div
            style={{
              padding: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {user && (
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  style={{
                    background: "var(--vw-primary, #07A5A7)",
                  }}
                />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </Text>
              </div>
            )}
            <Button
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.92)",
                borderColor: "rgba(255,255,255,0.24)",
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </Sider>
      <Layout>
        <Content
          style={{
            padding: "32px 40px",
            background: "var(--vw-bg, #F4F7F9)",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
