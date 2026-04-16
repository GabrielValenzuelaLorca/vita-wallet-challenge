import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoginForm } from "@/hooks/useLoginForm";
import { ApiRequestError } from "@/services/httpClient";
import type { AuthContextType } from "@/contexts/authTypes";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useAuth", () => ({
  useAuthContext: (): AuthContextType => ({
    login: mockLogin,
    logout: vi.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(typeof result.current.handleLogin).toBe("function");
  });

  it("navigates to / on successful login", async () => {
    mockLogin.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLogin({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("sets errorMessage from ApiRequestError", async () => {
    mockLogin.mockRejectedValue(
      new ApiRequestError(401, "invalid_credentials", "Invalid credentials"),
    );

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLogin({
        email: "bad@example.com",
        password: "wrong",
      });
    });

    expect(result.current.errorMessage).toBe("Invalid credentials");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("sets fallback errorMessage for generic errors", async () => {
    mockLogin.mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLogin({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(result.current.errorMessage).toBe(
      "Ocurrió un error inesperado. Intenta nuevamente.",
    );
    expect(result.current.isSubmitting).toBe(false);
  });

  it("clears previous errorMessage on new submission", async () => {
    mockLogin
      .mockRejectedValueOnce(
        new ApiRequestError(401, "invalid_credentials", "Invalid credentials"),
      )
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLogin({
        email: "bad@example.com",
        password: "wrong",
      });
    });

    expect(result.current.errorMessage).toBe("Invalid credentials");

    await act(async () => {
      await result.current.handleLogin({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(result.current.errorMessage).toBeNull();
  });
});
