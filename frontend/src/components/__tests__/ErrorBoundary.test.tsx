import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function ThrowingComponent(): never {
  throw new Error("Test error");
}

function SafeComponent() {
  return <div>Everything is fine</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error from React's error boundary logging
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Everything is fine")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /recargar/i })).toBeInTheDocument();
  });

  it("renders the reload button that calls window.location.reload", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole("button", { name: /recargar/i });
    reloadButton.click();

    expect(reloadMock).toHaveBeenCalledOnce();
  });
});
