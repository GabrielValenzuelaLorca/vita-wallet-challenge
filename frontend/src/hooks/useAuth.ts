import { useContext } from "react";
import { AuthContext } from "@/contexts/authTypes";
import type { AuthContextType } from "@/contexts/authTypes";

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
