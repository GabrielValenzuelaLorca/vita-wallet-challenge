import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { LoginPage } from "@/pages/Login/LoginPage";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { ExchangePage } from "@/pages/Exchange/ExchangePage";
import { HistoryPage } from "@/pages/History/HistoryPage";

// Vita Wallet brand palette (from Figma):
//   Blue 1  #167287  → sidebar / dark teal
//   Blue 2  #05BCB9  → primary CTA / brand
//   Black   #010E11  → text primary
//   White   #F9F9FA  → card / surface
//   Gray 1  #B9C1C2  → muted
//   Gray 2  #DEE0E0  → borders
//   Gray 3  #F5F6F7  → app background
//   Red     #CE3434  → error
const vitaTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#05BCB9",
    colorInfo: "#05BCB9",
    colorSuccess: "#12B886",
    colorError: "#CE3434",
    colorWarning: "#F5A524",
    colorBgLayout: "#F5F6F7",
    colorBgContainer: "#F9F9FA",
    colorBorder: "#DEE0E0",
    colorTextBase: "#010E11",
    colorTextSecondary: "#5A6B7B",
    colorTextTertiary: "#B9C1C2",
    borderRadius: 10,
    borderRadiusLG: 16,
    borderRadiusSM: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 10,
      fontWeight: 500,
      primaryShadow: "none",
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: "0 2px 8px rgba(1, 14, 17, 0.06)",
    },
    Input: {
      controlHeight: 44,
      borderRadius: 10,
    },
    InputNumber: {
      controlHeight: 44,
      borderRadius: 10,
    },
    Select: {
      controlHeight: 44,
      borderRadius: 10,
    },
    Layout: {
      siderBg: "#167287",
      bodyBg: "#F5F6F7",
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemSelectedBg: "rgba(5, 188, 185, 0.22)",
      darkItemHoverBg: "rgba(255, 255, 255, 0.08)",
      darkItemColor: "rgba(255, 255, 255, 0.82)",
      darkItemSelectedColor: "#FFFFFF",
    },
    Table: {
      borderRadius: 12,
      headerBg: "#F5F6F7",
      headerColor: "#5A6B7B",
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export function App() {
  return (
    <ConfigProvider theme={vitaTheme}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/exchange" element={<ExchangePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}
