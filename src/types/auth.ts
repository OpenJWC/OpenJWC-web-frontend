export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  expiresAt: number;
};

export type AuthState = {
  jwt: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};
