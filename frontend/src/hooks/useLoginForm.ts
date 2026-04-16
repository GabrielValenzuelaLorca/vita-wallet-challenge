import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import { ApiRequestError } from "@/services/httpClient";
import type { LoginCredentials } from "@/types/auth";

interface UseLoginFormReturn {
  isSubmitting: boolean;
  errorMessage: string | null;
  handleLogin: (values: LoginCredentials) => Promise<void>;
}

export function useLoginForm(): UseLoginFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (values: LoginCredentials): Promise<void> => {
      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        await login(values);
        navigate("/");
      } catch (error: unknown) {
        if (error instanceof ApiRequestError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Ocurrió un error inesperado. Intenta nuevamente.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, navigate],
  );

  return { isSubmitting, errorMessage, handleLogin };
}
