import { Typography, Button } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const SECTION_TITLES: Record<string, string> = {
  "/transfer": "Transferir",
  "/recharge": "Recargar",
  "/profile": "Perfil",
  "/help": "Ayuda",
};

export function UnderConstructionPage() {
  const location = useLocation();
  const sectionTitle = SECTION_TITLES[location.pathname] ?? "Esta sección";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 160px)",
        textAlign: "center",
        gap: 16,
      }}
    >
      <Title level={2} style={{ margin: 0, color: "var(--vw-blue-1, #167287)" }}>
        {sectionTitle} — Próximamente
      </Title>
      <Text style={{ color: "var(--vw-text-secondary, #5A6B7B)", maxWidth: 480 }}>
        Esta sección está en construcción. Mientras tanto, podés volver al inicio
        o explorar las funcionalidades ya disponibles.
      </Text>
      <Link to="/">
        <Button type="primary">Volver al inicio</Button>
      </Link>
    </div>
  );
}
