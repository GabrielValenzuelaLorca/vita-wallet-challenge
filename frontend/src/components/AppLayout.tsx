import { Layout, Menu, type MenuProps } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import { SidebarPattern } from "./SidebarPattern";

const { Sider, Content } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "/", label: <Link to="/">Inicio</Link> },
  { key: "/transfer", label: <Link to="/transfer">Transferir</Link> },
  { key: "/recharge", label: <Link to="/recharge">Recargar</Link> },
  { key: "/exchange", label: <Link to="/exchange">Intercambiar</Link> },
  { key: "/history", label: <Link to="/history">Historial</Link> },
  { key: "/profile", label: <Link to="/profile">Perfil</Link> },
  { key: "/help", label: <Link to="/help">Ayuda</Link> },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={372}
        breakpoint="lg"
        collapsedWidth={72}
        className="vw-sidebar"
        style={{
          background: "var(--vw-sidebar-bg, #167287)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <SidebarPattern />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ paddingTop: 120 }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                background: "transparent",
                borderRight: 0,
              }}
            />
          </div>
          <div style={{ padding: "0 0 24px" }}>
            <Menu
              theme="dark"
              mode="inline"
              selectable={false}
              items={[
                {
                  key: "logout",
                  label: "Cerrar sesión",
                  onClick: handleLogout,
                },
              ]}
              style={{
                background: "transparent",
                borderRight: 0,
              }}
            />
          </div>
        </div>
      </Sider>
      <Layout>
        <Content
          style={{
            padding: "80px var(--vw-page-margin, 120px)",
            background: "var(--vw-card-bg, #F9F9FA)",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
