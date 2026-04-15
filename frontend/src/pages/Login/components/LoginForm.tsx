import type { ReactNode } from "react";
import { Form, Alert, Typography } from "antd";
import { VitaButton } from "@/components/VitaButton";
import { VitaTextField } from "@/components/VitaTextField";
import type { LoginCredentials } from "@/types/auth";

const { Text } = Typography;

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
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
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
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <VitaTextField
            label="Contraseña"
            placeholder="Escribe tu contraseña"
            type="password"
          />
        </Form.Item>

        <Text
          style={{
            display: "block",
            textAlign: "right",
            marginTop: -16,
            marginBottom: 24,
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 14,
            color: "var(--vw-black, #010E11)",
            cursor: "pointer",
          }}
        >
          ¿Olvidaste tu contraseña?
        </Text>

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
