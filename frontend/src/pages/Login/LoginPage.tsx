import { Navigate } from "react-router-dom";
import { Card, Typography } from "antd";
import { useAuthContext } from "@/hooks/useAuth";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginForm } from "./components/LoginForm";

const { Title, Text } = Typography;

export function LoginPage() {
  const { isAuthenticated } = useAuthContext();
  const { handleLogin, isSubmitting, errorMessage } = useLoginForm();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Vita Wallet
          </Title>
          <Text type="secondary">Log in to your account</Text>
        </div>
        <LoginForm
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </Card>
    </div>
  );
}
