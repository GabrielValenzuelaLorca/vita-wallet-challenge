import { Link } from "react-router-dom";
import { Form, Alert } from "antd";
import { VitaButton } from "@/components/VitaButton";
import { VitaTextField } from "@/components/VitaTextField";
import type { RegisterCredentials } from "@/types/auth";
import styles from "../RegisterPage.module.css";

interface RegisterFormProps {
  onSubmit: (values: RegisterCredentials) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function RegisterForm({
  onSubmit,
  isSubmitting,
  errorMessage,
}: RegisterFormProps) {
  const [form] = Form.useForm<RegisterCredentials>();
  const emailValue = Form.useWatch("email", form);
  const passwordValue = Form.useWatch("password", form);
  const passwordConfirmationValue = Form.useWatch("passwordConfirmation", form);

  const isEmailValid =
    typeof emailValue === "string" &&
    emailValue.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue);
  const isPasswordValid =
    typeof passwordValue === "string" && passwordValue.length >= 6;
  const isConfirmationValid =
    typeof passwordConfirmationValue === "string" &&
    passwordConfirmationValue.length > 0 &&
    passwordConfirmationValue === passwordValue;
  const canSubmit =
    isEmailValid && isPasswordValid && isConfirmationValid && !isSubmitting;

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
      <Form<RegisterCredentials>
        form={form}
        name="register"
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
            valid={isEmailValid}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Ingresa tu contraseña" },
            {
              min: 6,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          ]}
        >
          <VitaTextField
            label="Contraseña"
            placeholder="Escribe tu contraseña"
            type="password"
          />
        </Form.Item>

        <Form.Item
          name="passwordConfirmation"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirma tu contraseña" },
            ({ getFieldValue }) => ({
              validator(_, value: string) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Las contraseñas no coinciden"),
                );
              },
            }),
          ]}
        >
          <VitaTextField
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            type="password"
          />
        </Form.Item>

        <Form.Item>
          <VitaButton
            htmlType="submit"
            loading={isSubmitting}
            disabled={!canSubmit}
            block
          >
            Crear cuenta
          </VitaButton>
        </Form.Item>
      </Form>

      <p className={styles.authLink}>
        ¿Ya tienes cuenta?{" "}
        <Link to="/login">Inicia sesión</Link>
      </p>
    </>
  );
}
