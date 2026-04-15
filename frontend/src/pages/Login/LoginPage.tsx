import { Navigate } from "react-router-dom";
import { Typography } from "antd";
import { useAuthContext } from "@/hooks/useAuth";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginForm } from "./components/LoginForm";

import coinLogo from "@/assets/illustrations/coin-logo.png";
import loginHero from "@/assets/illustrations/login-hero.png";

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
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <img
              src={coinLogo}
              alt="Vita Wallet"
              style={{ width: 44, height: 44 }}
            />
            <Title
              level={3}
              style={{
                margin: 0,
                color: "var(--vw-text-primary, #1A2B3C)",
                fontWeight: 700,
              }}
            >
              Vita Wallet
            </Title>
          </div>

          <Title
            level={2}
            style={{
              margin: "0 0 8px 0",
              fontWeight: 700,
              color: "var(--vw-text-primary, #1A2B3C)",
            }}
          >
            Welcome back
          </Title>
          <Text
            style={{
              color: "var(--vw-text-secondary, #5A6B7B)",
              fontSize: 15,
              display: "block",
              marginBottom: 32,
            }}
          >
            Log in to access your wallet, prices and exchange.
          </Text>

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
          background:
            "linear-gradient(135deg, var(--vw-sidebar-bg, #003B46) 0%, var(--vw-primary, #07A5A7) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <img
            src={loginHero}
            alt="Multi-currency wallet"
            style={{
              width: 320,
              maxWidth: "100%",
              margin: "0 auto 32px",
              display: "block",
            }}
          />
          <Title
            level={3}
            style={{ color: "#fff", margin: "0 0 12px 0", fontWeight: 700 }}
          >
            Multi-currency wallet
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
            Manage your fiat and crypto balances, get live prices and
            exchange between currencies — all in one place.
          </Text>
        </div>
      </div>
    </div>
  );
}
