import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/Login/LoginPage";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { ExchangePage } from "@/pages/Exchange/ExchangePage";
import { HistoryPage } from "@/pages/History/HistoryPage";

export function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchange"
            element={
              <ProtectedRoute>
                <ExchangePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}
