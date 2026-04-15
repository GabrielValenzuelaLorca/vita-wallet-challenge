import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: 24,
            textAlign: "center",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, color: "var(--vw-black, #010E11)" }}>
            Algo sali&oacute; mal
          </h2>
          <p style={{ margin: 0, color: "var(--vw-text-secondary, #5A6B7B)" }}>
            Ha ocurrido un error inesperado. Por favor, intenta recargar la p&aacute;gina.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(90deg, #05BCB9 0%, #167287 100%)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
