import { Navigate } from "react-router-dom";
import { Typography } from "antd";
import { useAuthContext } from "@/hooks/useAuth";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginForm } from "./components/LoginForm";

import loginHero from "@/assets/illustrations/login-hero.png";

const { Title } = Typography;

export function LoginPage() {
  const { isAuthenticated } = useAuthContext();
  const { handleLogin, isSubmitting, errorMessage } = useLoginForm();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(360px, 1fr) 1.2fr",
        background: "var(--vw-bg, #F4F7F9)",
      }}
    >
      {/* Left: form */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          background: "#FFFFFF",
        }}
      >
        <div style={{ width: "100%", maxWidth: 387 }}>
          <Title
            level={2}
            style={{
              margin: "0 0 32px 0",
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 600,
              fontSize: 48,
              lineHeight: "65px",
              color: "var(--vw-black, #010E11)",
            }}
          >
            Iniciar sesión
          </Title>

          <LoginForm
            onSubmit={handleLogin}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        </div>
      </div>

      {/* Right: hero / illustration */}
      <div
        style={{
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <img
          src={loginHero}
          alt="Multi-currency wallet"
          style={{
            width: 520,
            maxWidth: "100%",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
