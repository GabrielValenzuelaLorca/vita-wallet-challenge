import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginForm } from "./components/LoginForm";
import styles from "./LoginPage.module.css";

import loginHero from "@/assets/illustrations/login-hero.png";

export function LoginPage() {
  const { isAuthenticated } = useAuthContext();
  const { handleLogin, isSubmitting, errorMessage } = useLoginForm();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Iniciar sesión</h2>
          <LoginForm
            onSubmit={handleLogin}
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
