import type { ReactNode } from "react";
import { Form, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { VitaButton } from "@/components/VitaButton";
import { VitaTextField } from "@/components/VitaTextField";
import type { LoginCredentials } from "@/types/auth";

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
            placeholder="Email"
            prefix={<MailOutlined />}
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
            placeholder="Password"
            prefix={<LockOutlined />}
            type="password"
          />
        </Form.Item>

        <Form.Item>
          <VitaButton
            htmlType="submit"
            loading={isSubmitting}
            block
          >
            Log in
          </VitaButton>
        </Form.Item>

        {children}
      </Form>
    </>
  );
}
