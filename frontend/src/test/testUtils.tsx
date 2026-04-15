/* eslint-disable react-refresh/only-export-components -- test utilities, not subject to HMR */
import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { customRender as render };
export { default as userEvent } from "@testing-library/user-event";
export * from "@testing-library/react";
