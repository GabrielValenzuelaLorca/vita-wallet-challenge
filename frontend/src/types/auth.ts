export interface AuthUser {
  id: number;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
