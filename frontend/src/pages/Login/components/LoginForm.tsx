import type { ReactNode } from "react";
import { Form, Alert } from "antd";
import { VitaButton } from "@/components/VitaButton";
import { VitaTextField } from "@/components/VitaTextField";
import type { LoginCredentials } from "@/types/auth";
import styles from "../LoginPage.module.css";

interface LoginFormProps {
  onSubmit: (values: LoginCredentials) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  children?: ReactNode;
}

export function LoginForm({
  onSubmit,
  isSubmitting,
  errorMessage,
  children,
}: LoginFormProps) {
  const [form] = Form.useForm<LoginCredentials>();
  const emailValue = Form.useWatch("email", form);
  const passwordValue = Form.useWatch("password", form);

  const isEmailValid =
    typeof emailValue === "string" &&
    emailValue.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const isPasswordValid =
    typeof passwordValue === "string" && passwordValue.length >= 6;
  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

  return (
    <>
      {errorMessage !== null && (
        <Alert
          type="error"
          title={errorMessage}
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form<LoginCredentials>
        form={form}
        name="login"
        onFinish={onSubmit}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Ingresa tu correo electrónico" },
            { type: "email", message: "Ingresa un correo válido" },
          ]}
        >
          <VitaTextField
            label="Correo electrónico"
            placeholder="juan@gmail.com"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Ingresa tu contraseña" },
            { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
          ]}
        >
          <VitaTextField
            label="Contraseña"
            placeholder="Escribe tu contraseña"
            type="password"
          />
        </Form.Item>

        <button
          type="button"
          className={styles.forgotPassword}
          onClick={() => {}}
        >
          ¿Olvidaste tu contraseña?
        </button>

        <Form.Item>
          <VitaButton
            htmlType="submit"
            loading={isSubmitting}
            disabled={!canSubmit}
            block
          >
            Iniciar sesión
          </VitaButton>
        </Form.Item>

        {children}
      </Form>
    </>
  );
}
