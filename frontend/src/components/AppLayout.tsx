import { Layout, Menu, Button, Typography, Space } from "antd";
import {
  DashboardOutlined,
  SwapOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import type { ReactNode } from "react";

const { Header, Content } = Layout;
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
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 24px",
          background: "#001529",
        }}
      >
        <Text
          strong
          style={{ color: "#fff", fontSize: 18, whiteSpace: "nowrap" }}
        >
          Vita Wallet
        </Text>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Space>
          {user && (
            <Text style={{ color: "rgba(255,255,255,0.85)" }}>
              {user.email}
            </Text>
          )}
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
