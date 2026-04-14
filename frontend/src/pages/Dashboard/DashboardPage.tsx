import { Layout, Typography } from "antd";

const { Content } = Layout;
const { Title } = Typography;

export function DashboardPage() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Title level={2}>Dashboard</Title>
        <p>Dashboard will be built in Phase 3</p>
      </Content>
    </Layout>
  );
}
