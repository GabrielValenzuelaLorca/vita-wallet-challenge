import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import { ApiRequestError } from "@/services/httpClient";
import type { RegisterCredentials } from "@/types/auth";

interface UseRegisterFormReturn {
  isSubmitting: boolean;
  errorMessage: string | null;
  handleRegister: (values: RegisterCredentials) => Promise<void>;
}

export function useRegisterForm(): UseRegisterFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuthContext();
  const navigate = useNavigate();

  const handleRegister = useCallback(
    async (values: RegisterCredentials): Promise<void> => {
      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        await register({ email: values.email, password: values.password });
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
    [register, navigate],
  );

  return { isSubmitting, errorMessage, handleRegister };
}
