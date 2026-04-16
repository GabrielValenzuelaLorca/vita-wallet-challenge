import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { RegisterForm } from "./components/RegisterForm";
import styles from "./RegisterPage.module.css";

import loginHero from "@/assets/illustrations/login-hero.png";

export function RegisterPage() {
  const { isAuthenticated } = useAuthContext();
  const { handleRegister, isSubmitting, errorMessage } = useRegisterForm();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Crear cuenta</h2>
          <RegisterForm
            onSubmit={handleRegister}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        </div>
      </div>

      <div className={styles.heroPanel}>
        <img
          src={loginHero}
          alt="Multi-currency wallet"
          className={styles.heroImage}
        />
      </div>
    </div>
  );
}
