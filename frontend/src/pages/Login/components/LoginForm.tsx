import type { ReactNode } from "react";
import { Form, Input, Button, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
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
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            size="large"
          >
            Log in
          </Button>
        </Form.Item>

        {children}
      </Form>
    </>
  );
}
